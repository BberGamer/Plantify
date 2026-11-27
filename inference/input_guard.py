import math
from pathlib import Path

from .predictor import file_sha256, read_json


def decide_scope(positive, negative, min_similarity, min_margin):
    if not all(math.isfinite(value) and -1 <= value <= 1 for value in (positive, negative)):
        raise ValueError("Điểm MobileCLIP không hợp lệ.")
    margin = positive - negative
    if positive >= min_similarity and margin >= min_margin:
        return "passed", "plant_photo"
    if negative >= min_similarity and margin <= -min_margin:
        return "unsupported", "non_plant_photo"
    return "uncertain", "input_scope_uncertain"


class InputGuard:
    """Bộ lọc ảnh theo chủ thể dựa trên độ tương đồng ảnh và văn bản."""

    def __init__(self, settings):
        import open_clip
        import torch

        path = Path(__file__).with_suffix(".json")
        config = read_json(path)
        for filename, key in (
            ("open_clip_model.safetensors", "weights_sha256"),
            ("open_clip_config.json", "config_sha256"),
        ):
            if file_sha256(settings.guard_model_dir / filename) != config[key]:
                raise ValueError(f"Bundle MobileCLIP sai mã SHA-256: {filename}")
        self.min_similarity = config["min_similarity"]
        self.min_margin = config["min_margin"]
        if not all(0 < value <= 1 for value in (self.min_similarity, self.min_margin)):
            raise ValueError("Ngưỡng MobileCLIP phải lớn hơn 0 và không quá 1.")
        positive = config["positive_prompts"]
        negative = config["negative_prompts"]
        self.positive_count = len(positive)
        self.device = "cuda:0" if settings.device == "0" else "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            f"local-dir:{settings.guard_model_dir}", device=self.device,
        )
        self.model.eval()
        # Tokenizer đóng gói trong OpenCLIP dùng đúng đệm token, không tải từ mạng.
        tokens = open_clip.get_tokenizer("MobileCLIP2-S0")(positive + negative).to(self.device)
        with torch.inference_mode():
            self.text_features = self.model.encode_text(tokens, normalize=True)
        self.info = {
            "name": config["model_id"], "revision": config["revision"],
            "sha256": config["weights_sha256"], "profile_sha256": file_sha256(path),
            "min_similarity": self.min_similarity, "min_margin": self.min_margin,
        }

    def scores(self, image):
        import torch

        inputs = self.preprocess(image).unsqueeze(0).to(self.device)
        with torch.inference_mode():
            features = self.model.encode_image(inputs, normalize=True)
            similarities = (features @ self.text_features.T)[0]
        return (
            float(similarities[:self.positive_count].max().item()),
            float(similarities[self.positive_count:].max().item()),
        )

    def check(self, image):
        status, reason = decide_scope(*self.scores(image), self.min_similarity, self.min_margin)
        return {"status": status, "reason": reason}
