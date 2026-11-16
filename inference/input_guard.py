import math
import threading
import time

from .predictor import InferenceError, decode_image, file_sha256, read_json


def decide_scope(positive, negative, min_similarity, min_margin):
    if not all(math.isfinite(x) and -1 <= x <= 1 for x in (positive, negative)):
        raise ValueError("Invalid image-text similarity")
    margin = positive - negative
    if positive >= min_similarity and margin >= min_margin:
        return "passed", "plant_photo"
    if negative >= min_similarity and margin <= -min_margin:
        return "unsupported", "non_plant_photo"
    return "uncertain", "input_scope_uncertain"


class InputGuard:
    """Zero-shot image/text matching; scores are not calibrated probabilities."""

    def __init__(self, settings):
        import open_clip
        import torch

        self.settings = settings
        self._lock = threading.Lock()
        config = read_json(settings.guard_config)
        for filename, key in (
            ("open_clip_model.safetensors", "weights_sha256"),
            ("open_clip_config.json", "config_sha256"),
        ):
            if file_sha256(settings.guard_model_dir / filename) != config[key]:
                raise ValueError(f"Guard bundle checksum mismatch: {filename}")
        positive, negative = config["positive_prompts"], config["negative_prompts"]
        if not all(isinstance(group, list) and group and
                   all(isinstance(text, str) and text.strip() for text in group)
                   for group in (positive, negative)):
            raise ValueError("Guard requires positive and negative prompts")
        self.positive_count = len(positive)
        self.device = "cuda:0" if settings.device == "0" else "cpu"
        # Chỉ nạp weights/config cục bộ đã kiểm hash; không tải model khi phục vụ request.
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            f"local-dir:{settings.guard_model_dir}", device=self.device,
        )
        self.model.eval()
        # Tokenizer OpenCLIP chính thức dùng zero padding; HF pad=eos làm sai text embedding.
        tokenizer_name = config["tokenizer_model_name"]
        if open_clip.get_model_config(tokenizer_name) is None:
            raise ValueError("Guard tokenizer must use a bundled OpenCLIP model config")
        tokenizer = open_clip.get_tokenizer(tokenizer_name)
        tokens = tokenizer(positive + negative).to(self.device)
        with torch.inference_mode():
            self.text_features = self.model.encode_text(tokens, normalize=True)
        self.info = {"name": config["model_id"], "revision": config["revision"],
                     "sha256": config["weights_sha256"], "prompts_sha256": file_sha256(settings.guard_config),
                     "calibrated": False}

    def check(self, content, content_type, min_similarity, min_margin):
        import torch

        if not math.isfinite(min_similarity) or not 0 < min_similarity <= 1 or not math.isfinite(min_margin) or not 0 < min_margin <= 1:
            raise InferenceError(422, "INVALID_GUARD_THRESHOLDS", "Ngưỡng kiểm tra ảnh không hợp lệ.")
        if not self._lock.acquire(blocking=False):
            raise InferenceError(503, "INFERENCE_BUSY", "Bộ kiểm tra ảnh đang bận. Vui lòng thử lại.")
        started = time.perf_counter()
        try:
            image, _ = decode_image(content, content_type, self.settings, prepare=False)
            tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            with torch.inference_mode():
                features = self.model.encode_image(tensor, normalize=True)
                similarities = (features @ self.text_features.T)[0]
            positive = float(similarities[:self.positive_count].max().item())
            negative = float(similarities[self.positive_count:].max().item())
            status, reason = decide_scope(positive, negative, min_similarity, min_margin)
            return {"status": status, "reason": reason, "active": True, "model": dict(self.info),
                    "scores": {"positive": positive, "negative": negative, "margin": positive - negative},
                    "thresholds": {"min_similarity": min_similarity, "min_margin": min_margin},
                    "processing_ms": round((time.perf_counter() - started) * 1000, 2)}
        finally:
            self._lock.release()
