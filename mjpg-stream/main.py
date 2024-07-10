from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import cv2
from ultralytics import YOLO
import torch
import threading
import time
from collections import defaultdict
import asyncio
import json
from datetime import datetime

app = FastAPI()

# Allow CORS for React app
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check if GPU is available and load the model accordingly
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("./models/tomato_classification.pt").to(device)  # Load the model to GPU if available
model2 = YOLO("./models/tomato_re_detect.pt").to(device)
model3 = YOLO("./models/leaves_detect.pt").to(device)

# Track counts of each class
counts = defaultdict(int)
frame_interval = 30  # Interval to reset counts
current_frame = 0

class VideoCamera:
    def __init__(self):
        self.cap = cv2.VideoCapture("http://192.168.0.221:8000/stream.mjpg")
        self.lock = threading.Lock()
        self.frame = None
        self.ret = False
        self.running = True
        self.thread = threading.Thread(target=self.update_frame)
        self.thread.start()

    def update_frame(self):
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                self.lock.acquire()
                self.ret = ret
                self.frame = frame
                self.lock.release()
            time.sleep(0.01)  # Adjust sleep time for balance between CPU usage and latency

    def get_frame(self):
        self.lock.acquire()
        ret = self.ret
        frame = self.frame
        self.lock.release()
        return ret, frame

    def __del__(self):
        self.running = False
        self.thread.join()
        self.cap.release()

camera = VideoCamera()

def gen_frames(model):
    while True:
        ret, frame = camera.get_frame()
        if not ret:
            continue

        # YOLO inference
        results = model(frame)
        result_img = results[0].plot()  # Draw results on the frame

        # Convert image to JPEG
        ret, buffer = cv2.imencode('.jpg', result_img)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.get("/")
def index():
    return {"message": "YOLOv8 Video Streaming"}

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(gen_frames(model), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/video_feed_tomato")
def video_feed_tomato():
    return StreamingResponse(gen_frames(model2), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/video_feed_leaves")
def video_feed_tomato():
    return StreamingResponse(gen_frames(model3), media_type='multipart/x-mixed-replace; boundary=frame')

@app.websocket("/diseases")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            ret, frame = camera.get_frame()
            if not ret:
                await asyncio.sleep(0.01)
                continue
            
            results = model3(frame)
            
            frame_counts = defaultdict(int)
            for result in results:
                for cls in result.boxes.cls:
                    frame_counts[int(cls)] += 1
                    
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            data = {
                "time": current_time,
                "early_blight": frame_counts.get(0, 0),
                "healthy": frame_counts.get(1, 0),
                "late_blight": frame_counts.get(2, 0),
                "leaf_miner": frame_counts.get(3, 0),
                "leaf_mold": frame_counts.get(4, 0),
                "mosaic_virus": frame_counts.get(5, 0),
                "septoria": frame_counts.get(6, 0),
                "spider_mites": frame_counts.get(7, 0),
                "yellow_leaf_curl_virus": frame_counts.get(8, 0)
            }
            
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass


@app.websocket("/healthy")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            ret, frame = camera.get_frame()
            if not ret:
                await asyncio.sleep(0.01)
                continue

            # YOLO inference with model2
            results = model2(frame)

            # Count detected classes
            frame_counts = defaultdict(int)
            for result in results:
                for cls in result.boxes.cls:
                    frame_counts[int(cls)] += 1

            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            data = {
                "time": current_time,
                "ripe": frame_counts.get(0, 0),  # Update according to your class IDs
                "rotten": frame_counts.get(1, 0),
                "unripe": frame_counts.get(2, 0)
            }
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(1)  # Send data every second
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)