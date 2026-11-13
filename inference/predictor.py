import hashlib
import io
import json
import logging
import math
import os
import threading
import time
import warnings
from pathlib import Path

from PIL import Image, ImageOps, ImageStat, UnidentifiedImageError

from .config import Settings


LOGGER = logging.getLogger(__name__)
ULTRALYTICS_VERSION = "8.4.198"
CHECKPOINT = "best_macro_f1.pt"
IMAGE_SIZE = 384
CLASS_COUNT = 78
IMAGE_FORMATS = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}


class InferenceError(Exception):
    def __init__(self, status, code, message):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def file_sha256(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(8 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def verify_bundle(settings):
    root = settings.model_dir
    summary = read_json(root / "run_summary.json")
    if (
        summary.get("status") != "COMPLETED"
        or summary.get("task") != "classify"
        or summary.get("model") != "yolo26m-cls.pt"
        or summary.get("image_size") != IMAGE_SIZE
        or summary.get("classes") != CLASS_COUNT
    ):
        raise ValueError("Bundle phải là run YOLO26m classification COMPLETED, 384×384, 78 class.")
    run_id = summary.get("run_id")
    completed = summary.get("epochs_completed")
    if not isinstance(run_id, str) or not run_id or type(completed) is not int or completed <= 0:
        raise ValueError("Bundle thiếu RUN_ID hoặc số epoch hoàn thành hợp lệ.")
    checkpoint = summary["checkpoints"][CHECKPOINT]
    epoch = checkpoint.get("epoch")
    if checkpoint.get("run_id") != run_id or type(epoch) is not int or not 1 <= epoch <= completed:
        raise ValueError("Checkpoint không khớp RUN_ID/epoch của bundle.")
    sidecar = read_json(root / "checkpoint_metadata.json")
    if sidecar.get(CHECKPOINT) != checkpoint:
        raise ValueError("checkpoint_metadata.json khác run_summary.json.")
    inventory = [x for x in summary.get("packaged_weights", []) if x.get("file") == f"weights/{CHECKPOINT}"]
    if len(inventory) != 1 or any(inventory[0].get(k) != checkpoint.get(k) for k in ("sha256", "bytes", "epoch")):
        raise ValueError("Inventory của checkpoint không khớp metadata.")
    weights = root / "weights" / CHECKPOINT
    if weights.stat().st_size != checkpoint.get("bytes") or file_sha256(weights) != checkpoint.get("sha256"):
        raise ValueError("SHA-256/kích thước weights không khớp bundle; không nạp model.")
    mapping = read_json(root / "metadata" / "class_mapping.json")
    if not isinstance(mapping, list) or len(mapping) != CLASS_COUNT:
        raise ValueError("Mapping phải có đủ 78 class.")
    folders = []
    for class_id, entry in enumerate(mapping):
        if (
            type(entry.get("model_id")) is not int or entry["model_id"] != class_id
            or type(entry.get("source_id")) is not int or entry["source_id"] != class_id
            or not isinstance(entry.get("folder"), str) or not entry["folder"].startswith(f"c{class_id:03d}_")
            or not isinstance(entry.get("original_name"), str) or not entry["original_name"].strip()
            or not isinstance(entry.get("display_name"), str) or not entry["display_name"].strip()
            or type(entry.get("healthy")) is not bool
        ):
            raise ValueError(f"Mapping class {class_id} không hợp lệ.")
        folders.append(entry["folder"])
    if len(set(folders)) != CLASS_COUNT:
        raise ValueError("Mapping có folder trùng.")
    return weights, mapping, {
        "name": summary["model"], "run_id": run_id, "checkpoint": CHECKPOINT,
        "checkpoint_epoch": epoch, "epochs_completed": completed,
        "classes": CLASS_COUNT, "image_size": IMAGE_SIZE,
    }


def prepare_image(image):
    # Giữ đúng pipeline trong metadata/plantwild_preprocess.py của run đã train.
    image = ImageOps.exif_transpose(image).convert("RGB")
    return ImageOps.pad(
        image, (IMAGE_SIZE, IMAGE_SIZE), method=Image.Resampling.LANCZOS,
        color=(114, 114, 114), centering=(0.5, 0.5),
    )


def image_quality(image):
    # Chỉ chặn ảnh rõ ràng thiếu thông tin; đây không phải bộ phát hiện cây/OOD.
    gray = image.convert("L")
    gray.thumbnail((256, 256))
    stats = ImageStat.Stat(gray)
    mean = float(stats.mean[0])
    deviation = float(stats.stddev[0])
    reasons = []
    if min(image.size) < 96:
        reasons.append("too_small")
    if mean < 10 and deviation < 8:
        reasons.append("too_dark")
    elif mean > 247 and deviation < 8:
        reasons.append("too_bright")
    elif deviation < 2:
        reasons.append("low_detail")
    return {
        "usable": not reasons, "reasons": reasons,
        "mean_luminance": round(mean, 2), "std_luminance": round(deviation, 2),
        "scope": "basic_image_quality_only",
    }


def decode_image(content, content_type, settings):
    if not content:
        raise InferenceError(400, "EMPTY_IMAGE", "Ảnh tải lên rỗng.")
    if len(content) > settings.max_file_bytes:
        raise InferenceError(413, "IMAGE_TOO_LARGE", "Ảnh không được vượt quá 10 MiB.")
    mime = (content_type or "").split(";", 1)[0].strip().lower()
    if mime not in IMAGE_FORMATS.values():
        raise InferenceError(415, "UNSUPPORTED_IMAGE", "Chỉ nhận ảnh JPEG, PNG hoặc WebP.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(content)) as image:
                if image.format not in IMAGE_FORMATS or IMAGE_FORMATS[image.format] != mime:
                    raise InferenceError(415, "UNSUPPORTED_IMAGE", "Nội dung ảnh không khớp định dạng khai báo.")
                if image.width * image.height > settings.max_image_pixels:
                    raise InferenceError(413, "IMAGE_DIMENSIONS_TOO_LARGE", "Ảnh không được vượt quá 25 megapixel.")
                if getattr(image, "n_frames", 1) != 1:
                    raise InferenceError(415, "ANIMATED_IMAGE", "Vui lòng gửi ảnh tĩnh.")
                image.verify()
            # Mở lại sau verify để giải mã toàn bộ và xử lý EXIF từ ảnh gốc.
            with Image.open(io.BytesIO(content)) as image:
                image.load()
                oriented = ImageOps.exif_transpose(image)
                dimensions = {"width": oriented.width, "height": oriented.height,
                              "quality": image_quality(oriented)}
                prepared = prepare_image(oriented)
        return prepared, dimensions
    except InferenceError:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise InferenceError(413, "IMAGE_DIMENSIONS_TOO_LARGE", "Ảnh có kích thước quá lớn.") from exc
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError) as exc:
        raise InferenceError(400, "INVALID_IMAGE", "Ảnh hỏng hoặc không đọc được. Vui lòng chọn ảnh khác.") from exc


class PlantClassifier:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._lock = threading.Lock()
        weights, self.mapping, self.info = verify_bundle(settings)
        # Không để Ultralytics tự cài dependency khi server đang khởi động.
        os.environ["YOLO_AUTOINSTALL"] = "false"
        import torch
        import ultralytics
        from ultralytics import YOLO
        from ultralytics.data.augment import classify_transforms

        if ultralytics.__version__ != ULTRALYTICS_VERSION:
            raise ValueError(f"Cần ultralytics=={ULTRALYTICS_VERSION}, đang có {ultralytics.__version__}.")
        if settings.device == "0" and (torch.version.cuda is None or not torch.cuda.is_available()):
            raise ValueError("Đã chọn GPU 0 nhưng Torch/CUDA chưa hoạt động; không tự chuyển sang CPU.")
        torch.set_num_threads(settings.threads)
        self.model = YOLO(str(weights))
        names = self.model.names
        ordered = [names[i] for i in range(len(names))] if isinstance(names, dict) else list(names)
        if self.model.task != "classify" or ordered != [entry["folder"] for entry in self.mapping]:
            raise ValueError("task/model.names không khớp mapping của bundle.")
        self.info = {**self.info, "device": settings.device}
        # Khởi tạo predictor và warmup một lần; health chỉ sẵn sàng khi bước này thành công.
        sample = Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE), (17, 83, 151))
        sample.paste((233, 41, 7), (0, 0, IMAGE_SIZE // 3, IMAGE_SIZE // 2))
        self._predict(sample)
        actual = self.model.predictor.transforms(sample)
        expected = classify_transforms(IMAGE_SIZE)(sample)
        if not torch.equal(actual, expected):
            raise ValueError("Transforms inference khác preprocessing validation đã kiểm tra.")
        LOGGER.info("Model sẵn sàng: run=%s checkpoint=%s epoch=%s device=%s",
                    self.info["run_id"], CHECKPOINT, self.info["checkpoint_epoch"], settings.device)

    def _predict(self, image):
        results = self.model.predict(
            image, imgsz=IMAGE_SIZE, device=self.settings.device,
            augment=False, verbose=False, save=False, stream=False,
        )
        if len(results) != 1 or results[0].probs is None or len(results[0].probs.data) != CLASS_COUNT:
            raise RuntimeError("Model trả kết quả không hợp lệ.")
        return results[0].probs

    def predict(self, content, content_type):
        if not self._lock.acquire(blocking=False):
            raise InferenceError(503, "INFERENCE_BUSY", "Model đang xử lý ảnh khác. Vui lòng thử lại.")
        started = time.perf_counter()
        try:
            image, dimensions = decode_image(content, content_type, self.settings)
            probabilities = self._predict(image)
            candidates = []
            for index in probabilities.top5:
                index = int(index)
                score = float(probabilities.data[index])
                if not math.isfinite(score) or not 0 <= score <= 1:
                    raise RuntimeError("Confidence không hợp lệ.")
                entry = self.mapping[index]
                candidates.append({
                    "class_id": index, "class_name": entry["original_name"],
                    "display_name": entry["display_name"], "is_healthy": entry["healthy"],
                    "confidence": score,
                })
            return {
                "prediction": candidates[0], "top5": candidates,
                "image": dimensions, "model": dict(self.info),
                "processing_ms": round((time.perf_counter() - started) * 1000, 2),
            }
        finally:
            self._lock.release()
