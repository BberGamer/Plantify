const AppError = require("../../utils/app-error");
const { getDiagnosisConfig } = require("../../config/diagnosis");

const unavailable = () => new AppError(
  "DIAGNOSIS_UNAVAILABLE", 503,
  "Dịch vụ nhận diện chưa sẵn sàng. Vui lòng thử lại sau.",
);
const invalidResponse = () => new AppError(
  "DIAGNOSIS_INVALID_RESPONSE", 502,
  "Dịch vụ nhận diện trả kết quả không hợp lệ. Vui lòng thử lại.",
);

const responseText = async (response) => {
  if (!response.body?.getReader) {
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > 65536) throw invalidResponse();
    return text;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 65536) {
        await reader.cancel().catch(() => {});
        throw invalidResponse();
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally { reader.releaseLock(); }
};

const createInferenceClient = ({ fetchImpl = globalThis.fetch } = {}) => ({
  async predict(photo, { signal, config = getDiagnosisConfig() } = {}) {
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      abort();
    }, config.timeoutMs);
    timer.unref?.();
    try {
      const form = new FormData();
      const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[photo.mimetype];
      form.append("photo", new Blob([photo.buffer], { type: photo.mimetype }), `plant.${extension}`);
      const response = await fetchImpl(config.inferenceUrl, {
        method: "POST", body: form, signal: controller.signal, redirect: "error",
        headers: { Accept: "application/json" },
      });
      const text = await responseText(response);
      let body;
      try { body = JSON.parse(text); } catch { throw invalidResponse(); }
      if (!response.ok) {
        if (response.status === 503 && body.code === "INFERENCE_BUSY")
          throw new AppError("DIAGNOSIS_BUSY", 503, "Model đang xử lý ảnh khác. Vui lòng thử lại sau ít giây.");
        if (response.status >= 500) throw unavailable();
        const invalidPhotoCodes = new Set([
          "EMPTY_IMAGE", "INVALID_IMAGE", "IMAGE_TOO_LARGE", "IMAGE_DIMENSIONS_TOO_LARGE",
          "UNSUPPORTED_IMAGE", "ANIMATED_IMAGE",
        ]);
        if ([400, 413, 415].includes(response.status) && invalidPhotoCodes.has(body.code))
          throw new AppError("DIAGNOSIS_INVALID_PHOTO", response.status,
            "Ảnh không hợp lệ. Chọn một ảnh JPEG, PNG hoặc WebP tĩnh, tối đa 10 MiB và 25 megapixel.");
        throw invalidResponse();
      }
      if (!body || body.success !== true || !body.data) throw invalidResponse();
      return body.data;
    } catch (error) {
      if (signal?.aborted)
        throw new AppError("REQUEST_ABORTED", 499, "Yêu cầu đã được hủy.");
      if (timedOut)
        throw new AppError("DIAGNOSIS_TIMEOUT", 504,
          "Phân tích ảnh mất quá nhiều thời gian. Vui lòng thử lại.");
      if (error instanceof AppError) throw error;
      throw unavailable();
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  },
});

module.exports = { ...createInferenceClient(), createInferenceClient };
