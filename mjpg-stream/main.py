import asyncio
import threading
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

import cv2
import torch
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
CAMERA_STREAM_URL = "http://100.124.107.121:8001/stream.mjpg"
FRAME_SLEEP_SECONDS = 0.01
JPEG_QUALITY = 80
INFERENCE_FPS = 3
INFERENCE_IMAGE_SIZE = 320
INFERENCE_PARALLELISM = 1
USE_OPENVINO_IF_AVAILABLE = True

camera = None
tomato_classification_pipeline = None
tomato_detect_pipeline = None
leaves_detect_pipeline = None


class VideoCamera:
    def __init__(self, stream_url):
        self.cap = cv2.VideoCapture(stream_url)
        self.lock = threading.Lock()
        self.frame = None
        self.ret = False
        self.running = True
        self.thread = threading.Thread(target=self.update_frame, daemon=True)
        self.thread.start()

    def update_frame(self):
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                with self.lock:
                    self.ret = ret
                    self.frame = frame
            # Balance CPU usage and latency.
            time.sleep(FRAME_SLEEP_SECONDS)

    def get_frame(self):
        with self.lock:
            ret = self.ret
            frame = self.frame
        return ret, frame

    def close(self):
        self.running = False
        self.thread.join(timeout=2)
        self.cap.release()


class DetectionPipeline:
    def __init__(self, name, model, camera_source, inference_lock):
        self.name = name
        self.model = model
        self.camera_source = camera_source
        self.inference_lock = inference_lock
        self.min_interval = 1 / INFERENCE_FPS
        self.state_lock = threading.Lock()
        self.latest_jpeg = None
        self.latest_counts = defaultdict(int)
        self.latest_timestamp = None
        self.running = True
        self.thread = threading.Thread(target=self.update_cache, daemon=True)
        self.thread.start()

    def update_cache(self):
        while self.running:
            loop_started_at = time.perf_counter()
            ret, frame = self.camera_source.get_frame()
            if not ret or frame is None:
                time.sleep(FRAME_SLEEP_SECONDS)
                continue

            with self.inference_lock:
                with torch.inference_mode():
                    results = self.model(
                        frame,
                        imgsz=INFERENCE_IMAGE_SIZE,
                        verbose=False,
                    )

            result_img = results[0].plot()
            encoded, buffer = cv2.imencode(
                ".jpg",
                result_img,
                [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY],
            )
            if encoded:
                with self.state_lock:
                    self.latest_jpeg = buffer.tobytes()
                    self.latest_counts = count_detected_classes(results)
                    self.latest_timestamp = datetime.now()

            elapsed = time.perf_counter() - loop_started_at
            time.sleep(max(FRAME_SLEEP_SECONDS, self.min_interval - elapsed))

    def get_jpeg(self):
        with self.state_lock:
            return self.latest_jpeg

    def get_counts(self):
        with self.state_lock:
            return dict(self.latest_counts), self.latest_timestamp

    def close(self):
        self.running = False
        self.thread.join(timeout=2)


def resolve_model_source(models_dir, model_file_name):
    model_path = models_dir / model_file_name
    openvino_path = models_dir / f"{model_path.stem}_openvino_model"
    if USE_OPENVINO_IF_AVAILABLE and openvino_path.exists():
        return openvino_path
    return model_path


def load_model(model_source, device):
    model = YOLO(str(model_source), task="detect")
    if Path(model_source).suffix == ".pt":
        model = model.to(device)
    return model


@asynccontextmanager
async def lifespan(_app):
    global camera
    global leaves_detect_pipeline
    global tomato_classification_pipeline
    global tomato_detect_pipeline

    device = "cuda" if torch.cuda.is_available() else "cpu"
    models_dir = BASE_DIR / "models"
    camera = VideoCamera(CAMERA_STREAM_URL)
    inference_lock = threading.BoundedSemaphore(INFERENCE_PARALLELISM)
    tomato_classification_model = load_model(
        resolve_model_source(models_dir, "tomato_classification.pt"),
        device,
    )
    tomato_detect_model = load_model(
        resolve_model_source(models_dir, "tomato_re_detect.pt"),
        device,
    )
    leaves_detect_model = load_model(
        resolve_model_source(models_dir, "leaves_detect.pt"),
        device,
    )
    tomato_classification_pipeline = DetectionPipeline(
        "tomato_classification",
        tomato_classification_model,
        camera,
        inference_lock,
    )
    tomato_detect_pipeline = DetectionPipeline(
        "tomato_detect",
        tomato_detect_model,
        camera,
        inference_lock,
    )
    leaves_detect_pipeline = DetectionPipeline(
        "leaves_detect",
        leaves_detect_model,
        camera,
        inference_lock,
    )

    try:
        yield
    finally:
        for pipeline in (
            tomato_classification_pipeline,
            tomato_detect_pipeline,
            leaves_detect_pipeline,
        ):
            if pipeline is not None:
                pipeline.close()
        if camera is not None:
            camera.close()


app = FastAPI(lifespan=lifespan)

# Allow CORS for React app
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def count_detected_classes(results):
    frame_counts = defaultdict(int)
    for result in results:
        for cls in result.boxes.cls:
            frame_counts[int(cls)] += 1
    return frame_counts


def gen_frames(detection_pipeline):
    while True:
        if detection_pipeline is None:
            time.sleep(FRAME_SLEEP_SECONDS)
            continue

        frame = detection_pipeline.get_jpeg()
        if frame is None:
            time.sleep(FRAME_SLEEP_SECONDS)
            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        )


def build_counts_payload(detection_pipeline, class_labels):
    counts, timestamp = detection_pipeline.get_counts()
    if timestamp is None:
        timestamp = datetime.now()

    data = {"time": timestamp.strftime("%Y-%m-%d %H:%M:%S")}
    for class_id, label in class_labels.items():
        data[label] = counts.get(class_id, 0)
    return data


@app.get("/")
def index():
    return {"message": "YOLOv8 Video Streaming"}


@app.get("/video_feed")
def video_feed():
    return StreamingResponse(
        gen_frames(tomato_classification_pipeline),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.get("/video_feed_tomato")
def video_feed_tomato():
    return StreamingResponse(
        gen_frames(tomato_detect_pipeline),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.get("/video_feed_leaves")
def video_feed_leaves():
    return StreamingResponse(
        gen_frames(leaves_detect_pipeline),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.websocket("/diseases")
async def diseases_websocket(websocket: WebSocket):
    await websocket.accept()
    class_labels = {
        0: "early_blight",
        1: "healthy",
        2: "late_blight",
        3: "leaf_miner",
        4: "leaf_mold",
        5: "mosaic_virus",
        6: "septoria",
        7: "spider_mites",
        8: "yellow_leaf_curl_virus",
    }
    try:
        while True:
            if leaves_detect_pipeline is None:
                await asyncio.sleep(FRAME_SLEEP_SECONDS)
                continue

            await websocket.send_json(
                build_counts_payload(leaves_detect_pipeline, class_labels)
            )
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass


@app.websocket("/healthy")
async def healthy_websocket(websocket: WebSocket):
    await websocket.accept()
    class_labels = {
        0: "ripe",
        1: "rotten",
        2: "unripe",
    }
    try:
        while True:
            if tomato_detect_pipeline is None:
                await asyncio.sleep(FRAME_SLEEP_SECONDS)
                continue

            await websocket.send_json(
                build_counts_payload(tomato_detect_pipeline, class_labels)
            )
            await asyncio.sleep(1)  # Send data every second
    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
