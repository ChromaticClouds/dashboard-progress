import threading
import time

import cv2

from config import FRAME_SLEEP_SECONDS


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
