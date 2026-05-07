import time
from datetime import datetime

from config import FRAME_SLEEP_SECONDS


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
