import { Platform } from "react-native";
import api from "./api";
import {
  getSessionContext,
  isSessionCurrent,
  sessionError,
} from "./sessionAccess";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const invalid = (code = "DIAGNOSIS_INVALID_RESPONSE") => {
  throw Object.assign(new Error("Dữ liệu chẩn đoán không hợp lệ."), { code });
};
const text = (value) => typeof value === "string" && value.trim().length > 0;
const optionalText = (value) => value === null || typeof value === "string";
const optionalId = (value) =>
  value === null || (typeof value === "string" && /^[a-f\d]{24}$/i.test(value));

const candidateValid = (item) =>
  item &&
  Number.isInteger(item.class_id) &&
  item.class_id >= 0 &&
  item.class_id < 78 &&
  text(item.class_name) &&
  text(item.display_name) &&
  text(item.plant_name) &&
  optionalText(item.disease_name) &&
  typeof item.is_healthy === "boolean" &&
  Number.isFinite(item.confidence) &&
  item.confidence >= 0 &&
  item.confidence <= 1 &&
  optionalId(item.plant_id) &&
  optionalId(item.disease_id) &&
  optionalText(item.symptoms) &&
  optionalText(item.care_advice);

function validateResponse(envelope) {
  const data = envelope?.data;
  if (
    envelope?.success !== true ||
    !["identified", "uncertain", "unrecognized"].includes(data?.status) ||
    !text(data.message) ||
    !Array.isArray(data.alternatives) ||
    data.alternatives.length !== 5 ||
    data.alternatives.some((item) => !candidateValid(item)) ||
    (data.status === "identified"
      ? !candidateValid(data.prediction)
      : data.prediction !== null) ||
    !Number.isInteger(data.image?.width) ||
    data.image.width <= 0 ||
    !Number.isInteger(data.image?.height) ||
    data.image.height <= 0 ||
    data.model?.classes !== 78 ||
    data.model?.name !== "yolo26m-cls.pt" ||
    data.model?.checkpoint !== "best_macro_f1.pt" ||
    data.model?.image_size !== 384 ||
    !text(data.model?.run_id) ||
    !Number.isInteger(data.model?.checkpoint_epoch) ||
    data.model.checkpoint_epoch < 1 ||
    !Number.isInteger(data.model?.epochs_completed) ||
    data.model.checkpoint_epoch > data.model.epochs_completed ||
    !Number.isFinite(data.processing_ms) ||
    data.processing_ms < 0
  )
    invalid();
  const thresholds = data.thresholds;
  if (
    !thresholds ||
    thresholds.calibrated !== false ||
    ![
      thresholds.min_confidence,
      thresholds.min_margin,
      thresholds.unrecognized_below,
    ].every((value) => Number.isFinite(value) && value >= 0 && value <= 1) ||
    thresholds.unrecognized_below >= thresholds.min_confidence
  )
    invalid();
  const quality = data.image.quality;
  const reasons = ["too_small", "too_dark", "too_bright", "low_detail"];
  if (
    !quality ||
    typeof quality.usable !== "boolean" ||
    !Array.isArray(quality.reasons) ||
    quality.reasons.some((reason) => !reasons.includes(reason)) ||
    quality.usable !== (quality.reasons.length === 0)
  )
    invalid();
  if (
    new Set(data.alternatives.map((item) => item.class_id)).size !== 5 ||
    data.alternatives.some(
      (item, index) =>
        index > 0 &&
        item.confidence > data.alternatives[index - 1].confidence + 1e-8,
    ) ||
    data.alternatives.reduce((sum, item) => sum + item.confidence, 0) > 1.001
  )
    invalid();
  const top = data.alternatives[0];
  const margin = top.confidence - data.alternatives[1].confidence;
  // Không hiển thị kết luận nếu trạng thái server mâu thuẫn với bằng chứng gửi kèm.
  const expected = !quality.usable
    ? ["unrecognized", "poor_image_quality"]
    : top.confidence < thresholds.unrecognized_below
      ? ["unrecognized", "low_confidence"]
      : margin + 1e-9 < thresholds.min_margin
        ? ["uncertain", "ambiguous"]
        : top.confidence < thresholds.min_confidence
          ? ["uncertain", "low_confidence"]
          : ["identified", "confident"];
  if (data.status !== expected[0] || data.reason !== expected[1]) invalid();
  if (
    data.status === "identified" &&
    [
      "class_id",
      "class_name",
      "display_name",
      "plant_name",
      "disease_name",
      "is_healthy",
      "confidence",
    ].some((key) => data.prediction[key] !== top[key])
  )
    invalid();
  return envelope;
}

export default {
  async analyze(photo, { sessionContext = getSessionContext(), signal } = {}) {
    if (!photo || !text(photo.uri)) invalid("DIAGNOSIS_INVALID_PHOTO");
    if (photo.fileSize > 10 * 1024 * 1024) invalid("DIAGNOSIS_IMAGE_TOO_LARGE");
    if (!sessionContext?.token) throw sessionError("AUTH_REQUIRED");
    if (!isSessionCurrent(sessionContext))
      throw sessionError("SESSION_CHANGED");
    if (signal?.aborted)
      throw Object.assign(new Error(), { code: "ERR_CANCELED" });
    let mime = photo.mimeType?.toLowerCase();
    if (mime === "image/jpg") mime = "image/jpeg";
    if (mime && !ALLOWED_TYPES.includes(mime))
      invalid("DIAGNOSIS_UNSUPPORTED_IMAGE");
    const body = new FormData();
    if (Platform.OS === "web") {
      const response = await fetch(photo.uri, { signal });
      if (!response.ok) invalid("DIAGNOSIS_INVALID_PHOTO");
      const blob = await response.blob();
      if (blob.size > 10 * 1024 * 1024) invalid("DIAGNOSIS_IMAGE_TOO_LARGE");
      mime = blob.type?.toLowerCase() || mime;
      if (!ALLOWED_TYPES.includes(mime)) invalid("DIAGNOSIS_UNSUPPORTED_IMAGE");
      body.append(
        "photo",
        blob,
        photo.fileName ||
          `plant.${mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"}`,
      );
    } else {
      // Camera chụp JPEG; album dùng mime từ picker hoặc phần mở rộng của URI.
      if (!mime) {
        const extension = photo.uri
          .split(/[?#]/, 1)[0]
          .split(".")
          .pop()
          ?.toLowerCase();
        mime =
          extension === "png"
            ? "image/png"
            : extension === "webp"
              ? "image/webp"
              : ["jpg", "jpeg"].includes(extension) || photo.source === "camera"
                ? "image/jpeg"
                : null;
      }
      if (!ALLOWED_TYPES.includes(mime)) invalid("DIAGNOSIS_UNSUPPORTED_IMAGE");
      body.append("photo", {
        uri: photo.uri,
        name:
          photo.fileName ||
          `plant.${mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"}`,
        type: mime,
      });
    }
    // Không để JSON header mặc định hoặc tự đặt boundary cho multipart.
    const response = await api.post("/diagnosis", body, {
      signal,
      sessionContext,
      timeout: 30000,
      headers: { "Content-Type": null },
    });
    return validateResponse(response.data);
  },
};
