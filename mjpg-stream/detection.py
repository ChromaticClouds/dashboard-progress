import threading
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import cv2
import torch
from ultralytics import YOLO

from config import (
    FRAME_SLEEP_SECONDS,
    INFERENCE_FPS,
    INFERENCE_IMAGE_SIZE,
    JPEG_QUALITY,
    SHOW_FPS_OVERLAY,
    USE_OPENVINO_IF_AVAILABLE,
)


def count_detected_classes(results):
    frame_counts = defaultdict(int)
    for result in results:
        for cls in result.boxes.cls:
            frame_counts[int(cls)] += 1
    return frame_counts


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


def draw_fps_overlay(frame, fps):
    if not SHOW_FPS_OVERLAY:
        return frame

    text = f"FPS: {fps:.1f}"
    origin = (12, 32)
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.8
    thickness = 2
    text_size, baseline = cv2.getTextSize(text, font, scale, thickness)
    width, height = text_size
    x, y = origin
    cv2.rectangle(
        frame,
        (x - 6, y - height - 8),
        (x + width + 6, y + baseline + 6),
        (0, 0, 0),
        -1,
    )
    cv2.putText(
        frame,
        text,
        origin,
        font,
        scale,
        (0, 255, 0),
        thickness,
        cv2.LINE_AA,
    )
    return frame


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
        self.last_frame_at = None
        self.smoothed_fps = 0
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

            now = time.perf_counter()
            if self.last_frame_at is not None:
                instant_fps = 1 / max(now - self.last_frame_at, 0.001)
                if self.smoothed_fps:
                    self.smoothed_fps = self.smoothed_fps * 0.8 + instant_fps * 0.2
                else:
                    self.smoothed_fps = instant_fps
            self.last_frame_at = now

            result_img = draw_fps_overlay(results[0].plot(), self.smoothed_fps)
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
