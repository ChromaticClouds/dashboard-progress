import argparse
import asyncio
import statistics
import time
from pathlib import Path

import cv2
import numpy as np
import torch
from ultralytics import YOLO

DEFAULT_FRAME_COUNT = 180
DEFAULT_RUNS = 3
FRAME_SLEEP_SECONDS = 0.01
JPEG_QUALITY = 80
INFERENCE_FPS = 3
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = BASE_DIR / "models" / "tomato_re_detect.pt"


class SyntheticCamera:
    def __init__(self, every_nth_frame_missing=0):
        self.index = 0
        self.every_nth_frame_missing = every_nth_frame_missing

    def get_frame(self):
        self.index += 1
        if (
            self.every_nth_frame_missing
            and self.index % self.every_nth_frame_missing == 0
        ):
            return False, None

        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        x = (self.index * 7) % 560
        cv2.rectangle(frame, (x, 160), (x + 80, 300), (0, 200, 80), -1)
        cv2.putText(
            frame,
            f"frame {self.index}",
            (24, 48),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2,
        )
        return True, frame


def fake_detection(frame):
    result = cv2.GaussianBlur(frame, (15, 15), 0)
    result = cv2.Canny(result, 80, 160)
    return cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)


def load_real_model(model_path):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = YOLO(str(model_path), task="detect")
    if Path(model_path).suffix == ".pt":
        model = model.to(device)
    return model, device


def run_real_detection(model, frame, imgsz):
    return model(frame, imgsz=imgsz, verbose=False)


def run_real_detection_optimized(model, frame, imgsz):
    with torch.inference_mode():
        return model(frame, imgsz=imgsz, verbose=False)


def encode_default(frame):
    encoded, _buffer = cv2.imencode(".jpg", frame)
    return encoded


def encode_optimized(frame):
    encoded, _buffer = cv2.imencode(
        ".jpg",
        frame,
        [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY],
    )
    return encoded


def percentile(values, percent):
    index = round((len(values) - 1) * percent / 100)
    return sorted(values)[index]


def build_result(label, elapsed, latencies, processed, skipped):
    fps = processed / elapsed if elapsed else 0
    avg_ms = statistics.mean(latencies) * 1000
    p95_ms = percentile(latencies, 95) * 1000
    return {
        "label": label,
        "elapsed": elapsed,
        "processed": processed,
        "skipped": skipped,
        "fps": fps,
        "avg_ms": avg_ms,
        "p95_ms": p95_ms,
    }


def print_result(result):
    print(f"\n[{result['label']}]")
    print(f"elapsed: {result['elapsed']:.3f}s")
    print(f"processed: {result['processed']}")
    print(f"skipped: {result['skipped']}")
    print(f"throughput: {result['fps']:.2f} frames/sec")
    print(f"avg latency: {result['avg_ms']:.2f}ms")
    print(f"p95 latency: {result['p95_ms']:.2f}ms")


def print_aggregate(label, results):
    fps_values = [result["fps"] for result in results]
    avg_values = [result["avg_ms"] for result in results]
    p95_values = [result["p95_ms"] for result in results]
    elapsed_values = [result["elapsed"] for result in results]

    print(f"\n[{label}]")
    print(f"runs: {len(results)}")
    print(
        "elapsed avg/min/max: "
        f"{statistics.mean(elapsed_values):.3f}s / "
        f"{min(elapsed_values):.3f}s / "
        f"{max(elapsed_values):.3f}s"
    )
    print(
        "throughput avg/min/max: "
        f"{statistics.mean(fps_values):.2f} / "
        f"{min(fps_values):.2f} / "
        f"{max(fps_values):.2f} frames/sec"
    )
    print(
        "avg latency avg/min/max: "
        f"{statistics.mean(avg_values):.2f}ms / "
        f"{min(avg_values):.2f}ms / "
        f"{max(avg_values):.2f}ms"
    )
    print(
        "p95 latency avg/min/max: "
        f"{statistics.mean(p95_values):.2f}ms / "
        f"{min(p95_values):.2f}ms / "
        f"{max(p95_values):.2f}ms"
    )


def run_previous_style(frame_count):
    camera = SyntheticCamera(every_nth_frame_missing=10)
    latencies = []
    processed = 0
    skipped = 0
    start = time.perf_counter()

    while processed + skipped < frame_count:
        frame_start = time.perf_counter()
        ret, frame = camera.get_frame()
        if not ret:
            skipped += 1
            continue

        result_img = fake_detection(frame)
        encode_default(result_img)
        latencies.append(time.perf_counter() - frame_start)
        processed += 1

    return build_result(
        "previous style",
        time.perf_counter() - start,
        latencies,
        processed,
        skipped,
    )


def run_optimized_style(frame_count):
    camera = SyntheticCamera(every_nth_frame_missing=10)
    latencies = []
    processed = 0
    skipped = 0
    start = time.perf_counter()

    while processed + skipped < frame_count:
        frame_start = time.perf_counter()
        ret, frame = camera.get_frame()
        if not ret or frame is None:
            skipped += 1
            time.sleep(FRAME_SLEEP_SECONDS)
            continue

        result_img = fake_detection(frame)
        encode_optimized(result_img)
        latencies.append(time.perf_counter() - frame_start)
        processed += 1

    return build_result(
        "optimized style",
        time.perf_counter() - start,
        latencies,
        processed,
        skipped,
    )


def run_cached_pipeline_style(frame_count):
    camera = SyntheticCamera(every_nth_frame_missing=10)
    latencies = []
    processed = 0
    skipped = 0
    latest_jpeg = None
    last_inference_at = 0
    min_interval = 1 / INFERENCE_FPS
    start = time.perf_counter()

    while processed + skipped < frame_count:
        frame_start = time.perf_counter()
        ret, frame = camera.get_frame()
        if not ret or frame is None:
            skipped += 1
            time.sleep(FRAME_SLEEP_SECONDS)
            continue

        now = time.perf_counter()
        if latest_jpeg is None or now - last_inference_at >= min_interval:
            result_img = fake_detection(frame)
            encoded, buffer = cv2.imencode(
                ".jpg",
                result_img,
                [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY],
            )
            if encoded:
                latest_jpeg = buffer.tobytes()
                last_inference_at = time.perf_counter()

        if latest_jpeg is None:
            skipped += 1
            continue

        latencies.append(time.perf_counter() - frame_start)
        processed += 1

    return build_result(
        "cached pipeline style",
        time.perf_counter() - start,
        latencies,
        processed,
        skipped,
    )


def run_previous_real_model_style(frame_count, model, imgsz):
    camera = SyntheticCamera(every_nth_frame_missing=10)
    latencies = []
    processed = 0
    skipped = 0
    start = time.perf_counter()

    while processed + skipped < frame_count:
        frame_start = time.perf_counter()
        ret, frame = camera.get_frame()
        if not ret:
            skipped += 1
            continue

        results = run_real_detection(model, frame, imgsz)
        result_img = results[0].plot()
        encode_default(result_img)
        latencies.append(time.perf_counter() - frame_start)
        processed += 1

    return build_result(
        "previous style with real model",
        time.perf_counter() - start,
        latencies,
        processed,
        skipped,
    )


def run_optimized_real_model_style(frame_count, model, imgsz):
    camera = SyntheticCamera(every_nth_frame_missing=10)
    latencies = []
    processed = 0
    skipped = 0
    start = time.perf_counter()

    while processed + skipped < frame_count:
        frame_start = time.perf_counter()
        ret, frame = camera.get_frame()
        if not ret or frame is None:
            skipped += 1
            time.sleep(FRAME_SLEEP_SECONDS)
            continue

        results = run_real_detection_optimized(model, frame, imgsz)
        result_img = results[0].plot()
        encode_optimized(result_img)
        latencies.append(time.perf_counter() - frame_start)
        processed += 1

    return build_result(
        "optimized style with real model",
        time.perf_counter() - start,
        latencies,
        processed,
        skipped,
    )


def run_cached_pipeline_real_model_style(frame_count, model, imgsz):
    camera = SyntheticCamera(every_nth_frame_missing=10)
    latencies = []
    processed = 0
    skipped = 0
    latest_jpeg = None
    last_inference_at = 0
    min_interval = 1 / INFERENCE_FPS
    start = time.perf_counter()

    while processed + skipped < frame_count:
        frame_start = time.perf_counter()
        ret, frame = camera.get_frame()
        if not ret or frame is None:
            skipped += 1
            time.sleep(FRAME_SLEEP_SECONDS)
            continue

        now = time.perf_counter()
        if latest_jpeg is None or now - last_inference_at >= min_interval:
            results = run_real_detection_optimized(model, frame, imgsz)
            result_img = results[0].plot()
            encoded, buffer = cv2.imencode(
                ".jpg",
                result_img,
                [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY],
            )
            if encoded:
                latest_jpeg = buffer.tobytes()
                last_inference_at = time.perf_counter()

        if latest_jpeg is None:
            skipped += 1
            continue

        latencies.append(time.perf_counter() - frame_start)
        processed += 1

    return build_result(
        "cached pipeline style with real model",
        time.perf_counter() - start,
        latencies,
        processed,
        skipped,
    )


async def blocking_websocket_simulation(frame_count):
    camera = SyntheticCamera()
    latencies = []
    start = time.perf_counter()

    for _ in range(frame_count):
        frame_start = time.perf_counter()
        _ret, frame = camera.get_frame()
        fake_detection(frame)
        latencies.append(time.perf_counter() - frame_start)
        await asyncio.sleep(0)

    return build_result(
        "websocket blocking simulation",
        time.perf_counter() - start,
        latencies,
        frame_count,
        0,
    )


async def blocking_real_model_websocket_simulation(frame_count, model, imgsz):
    camera = SyntheticCamera()
    latencies = []
    start = time.perf_counter()

    for _ in range(frame_count):
        frame_start = time.perf_counter()
        _ret, frame = camera.get_frame()
        run_real_detection_optimized(model, frame, imgsz)
        latencies.append(time.perf_counter() - frame_start)
        await asyncio.sleep(0)

    return build_result(
        "websocket blocking with real model",
        time.perf_counter() - start,
        latencies,
        frame_count,
        0,
    )


async def threaded_websocket_simulation(frame_count):
    camera = SyntheticCamera()
    latencies = []
    start = time.perf_counter()

    for _ in range(frame_count):
        frame_start = time.perf_counter()
        _ret, frame = camera.get_frame()
        await asyncio.to_thread(fake_detection, frame)
        latencies.append(time.perf_counter() - frame_start)
        await asyncio.sleep(0)

    return build_result(
        "websocket to_thread simulation",
        time.perf_counter() - start,
        latencies,
        frame_count,
        0,
    )


async def threaded_real_model_websocket_simulation(frame_count, model, imgsz):
    camera = SyntheticCamera()
    latencies = []
    start = time.perf_counter()

    for _ in range(frame_count):
        frame_start = time.perf_counter()
        _ret, frame = camera.get_frame()
        await asyncio.to_thread(
            run_real_detection_optimized,
            model,
            frame,
            imgsz,
        )
        latencies.append(time.perf_counter() - frame_start)
        await asyncio.sleep(0)

    return build_result(
        "websocket to_thread with real model",
        time.perf_counter() - start,
        latencies,
        frame_count,
        0,
    )


async def run_suite(frame_count):
    return [
        run_previous_style(frame_count),
        run_optimized_style(frame_count),
        run_cached_pipeline_style(frame_count),
        await blocking_websocket_simulation(frame_count),
        await threaded_websocket_simulation(frame_count),
    ]


async def run_real_model_suite(frame_count, model, imgsz):
    return [
        run_previous_real_model_style(frame_count, model, imgsz),
        run_optimized_real_model_style(frame_count, model, imgsz),
        run_cached_pipeline_real_model_style(frame_count, model, imgsz),
        await blocking_real_model_websocket_simulation(frame_count, model, imgsz),
        await threaded_real_model_websocket_simulation(frame_count, model, imgsz),
    ]


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run a synthetic benchmark for mjpg-stream optimization."
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=DEFAULT_RUNS,
        help=f"Number of repeated benchmark runs. Default: {DEFAULT_RUNS}",
    )
    parser.add_argument(
        "--frames",
        type=int,
        default=DEFAULT_FRAME_COUNT,
        help=f"Frames per benchmark scenario. Default: {DEFAULT_FRAME_COUNT}",
    )
    parser.add_argument(
        "--show-each-run",
        action="store_true",
        help="Print detailed results for every run.",
    )
    parser.add_argument(
        "--real-model",
        action="store_true",
        help="Run the benchmark with an actual YOLO model.",
    )
    parser.add_argument(
        "--model-path",
        type=Path,
        default=DEFAULT_MODEL_PATH,
        help=f"YOLO .pt path for --real-model. Default: {DEFAULT_MODEL_PATH}",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="YOLO inference image size for --real-model. Default: 640",
    )
    return parser.parse_args()


async def main():
    args = parse_args()
    aggregate = {}

    print("Synthetic benchmark for mjpg-stream/main.py optimization")
    print("This uses generated frames, not the real camera.")
    print(f"runs: {args.runs}")
    print(f"frames per scenario: {args.frames}")

    model = None
    if args.real_model:
        model, device = load_real_model(args.model_path)
        print(f"model: {args.model_path}")
        print(f"device: {device}")
    else:
        print("model: synthetic OpenCV workload")

    for run_index in range(1, args.runs + 1):
        if args.real_model:
            results = await run_real_model_suite(args.frames, model, args.imgsz)
        else:
            results = await run_suite(args.frames)

        if args.show_each_run:
            print(f"\n=== run {run_index}/{args.runs} ===")
            for result in results:
                print_result(result)

        for result in results:
            aggregate.setdefault(result["label"], []).append(result)

    print("\n=== aggregate ===")
    for label, results in aggregate.items():
        print_aggregate(label, results)


if __name__ == "__main__":
    asyncio.run(main())
