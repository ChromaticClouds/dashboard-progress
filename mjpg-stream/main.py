from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import cv2
from ultralytics import YOLO
import torch
import threading
import time

app = FastAPI()

# Check if GPU is available and load the model accordingly
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("yolov8n.pt").to(device)  # Load the model to GPU if available

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

def gen_frames():
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
    return StreamingResponse(gen_frames(), media_type='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
