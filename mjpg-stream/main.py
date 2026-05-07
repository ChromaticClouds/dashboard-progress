import asyncio
import threading
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from camera import VideoCamera
from config import (
    BASE_DIR,
    CAMERA_STREAM_URL,
    FRAME_SLEEP_SECONDS,
    INFERENCE_PARALLELISM,
)
from detection import DetectionPipeline, load_model, resolve_model_source
from responses import build_counts_payload, gen_frames

camera = None
tomato_classification_pipeline = None
tomato_detect_pipeline = None
leaves_detect_pipeline = None


def create_pipeline(name, model_file_name, camera_source, inference_lock, device):
    models_dir = BASE_DIR / "models"
    model_source = resolve_model_source(models_dir, model_file_name)
    model = load_model(model_source, device)
    return DetectionPipeline(name, model, camera_source, inference_lock)


@asynccontextmanager
async def lifespan(_app):
    global camera
    global leaves_detect_pipeline
    global tomato_classification_pipeline
    global tomato_detect_pipeline

    device = "cuda" if torch.cuda.is_available() else "cpu"
    camera = VideoCamera(CAMERA_STREAM_URL)
    inference_lock = threading.BoundedSemaphore(INFERENCE_PARALLELISM)
    tomato_classification_pipeline = create_pipeline(
        "tomato_classification",
        "tomato_classification.pt",
        camera,
        inference_lock,
        device,
    )
    tomato_detect_pipeline = create_pipeline(
        "tomato_detect",
        "tomato_re_detect.pt",
        camera,
        inference_lock,
        device,
    )
    leaves_detect_pipeline = create_pipeline(
        "leaves_detect",
        "leaves_detect.pt",
        camera,
        inference_lock,
        device,
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
