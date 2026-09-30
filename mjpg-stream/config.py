import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CAMERA_STREAM_URL = os.getenv("CAMERA_STREAM_URL", "http://localhost:8000/stream.mjpg")
FRAME_SLEEP_SECONDS = 0.01
JPEG_QUALITY = 80
INFERENCE_FPS = 2
INFERENCE_IMAGE_SIZE = 320
INFERENCE_PARALLELISM = 1
SHOW_FPS_OVERLAY = True
USE_OPENVINO_IF_AVAILABLE = True
