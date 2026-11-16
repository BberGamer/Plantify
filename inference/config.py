import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    model_dir: Path
    device: str = "cpu"
    threads: int = 2
    max_file_bytes: int = 10 * 1024 * 1024
    max_image_pixels: int = 25_000_000
    guard_model_dir: Path = Path(__file__).resolve().parent / "input_guard_model"
    guard_config: Path = Path(__file__).resolve().parent / "input_guard.json"

    # Mục đích: Chặn cấu hình Python không hợp lệ.
    # Cách chạy: Kiểm tra thiết bị, số luồng CPU và giới hạn ảnh ngay khi tạo Settings.
    def __post_init__(self):
        if self.device not in {"cpu", "0"}:
            raise ValueError("PLANTIFY_INFERENCE_DEVICE chỉ nhận cpu hoặc 0 (một GPU).")
        if not 1 <= self.threads <= 32:
            raise ValueError("PLANTIFY_INFERENCE_THREADS phải nằm trong khoảng 1–32.")
        if self.max_file_bytes <= 0 or self.max_image_pixels <= 0:
            raise ValueError("Giới hạn ảnh phải lớn hơn 0.")

    # Mục đích: Đọc cấu hình chạy model từ môi trường.
    # Cách chạy: Lấy đường dẫn model, thiết bị và số luồng; dùng giá trị mặc định nếu chưa đặt.
    @classmethod
    def from_env(cls):
        root = Path(__file__).resolve().parent.parent
        model_dir = Path(os.environ.get("PLANTIFY_MODEL_DIR", str(root / "inference" / "model")))
        if not model_dir.is_absolute():
            model_dir = root / model_dir
        return cls(
            model_dir=model_dir.resolve(),
            device=os.environ.get("PLANTIFY_INFERENCE_DEVICE", "cpu").strip(),
            threads=int(os.environ.get("PLANTIFY_INFERENCE_THREADS", "2")),
            guard_model_dir=Path(os.environ.get("PLANTIFY_GUARD_MODEL_DIR", str(root / "inference/input_guard_model"))).resolve(),
            guard_config=Path(os.environ.get("PLANTIFY_GUARD_CONFIG", str(root / "inference/input_guard.json"))).resolve(),
        )
