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

const createInferenceClient = ({ fetchImpl = globalThis.fetch } = {}) => {
  const request = async (photo, { signal, config = getDiagnosisConfig() } = {}, checkInput = false) => {
    if (signal?.aborted) throw new AppError("REQUEST_ABORTED", 499, "Yêu cầu đã được hủy.");
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
      const url = new URL(config.inferenceUrl);
      if (checkInput) {
        url.pathname = url.pathname.replace(/\/predict$/, "/check-image");
        url.searchParams.set("min_similarity", config.inputGuard.minSimilarity);
        url.searchParams.set("min_margin", config.inputGuard.minMargin);
      }
      const response = await fetchImpl(url.toString(), {
        method: "POST", body: form, signal: controller.signal, redirect: "error",
        headers: { Accept: "application/json" },
      });
      const text = await responseText(response);
      let body;
      try { body = JSON.parse(text); } catch { throw invalidResponse(); }
      if (!response.ok) {
        if (checkInput && (response.status === 404 || response.status >= 500) && body.code !== "INFERENCE_BUSY")
          throw new AppError("DIAGNOSIS_INPUT_GUARD_UNAVAILABLE", 503, "Dịch vụ kiểm tra ảnh chưa sẵn sàng.");
        if (response.status === 503 && body.code === "INFERENCE_BUSY")
          throw new AppError("DIAGNOSIS_BUSY", 503, "Model đang xử lý ảnh khác. Vui lòng thử lại sau ít giây.");
        if (response.status >= 500) throw unavailable();
        const invalidPhotoCodes = new Set([
          "EMPTY_IMAGE", "INVALID_IMAGE", "IMAGE_TOO_LARGE", "IMAGE_DIMENSIONS_TOO_LARGE",
          "UNSUPPORTED_IMAGE", "ANIMATED_IMAGE",
        ]);
        if ([400, 413, 415].includes(response.status) && invalidPhotoCodes.has(body.code))
          throw new AppError("DIAGNOSIS_INVALID_PHOTO", response.status,
            typeof body.message === "string" ? body.message : "Ảnh không hợp lệ. Vui lòng chọn ảnh khác.",
            { reason: body.code });
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
      if (error instanceof AppError) {
        if (checkInput && error.code === "DIAGNOSIS_INVALID_RESPONSE")
          throw new AppError("DIAGNOSIS_INPUT_GUARD_UNAVAILABLE", 503, "Dịch vụ kiểm tra ảnh trả kết quả không hợp lệ.");
        throw error;
      }
      if (checkInput) throw new AppError("DIAGNOSIS_INPUT_GUARD_UNAVAILABLE", 503, "Không kết nối được dịch vụ kiểm tra ảnh.");
      throw unavailable();
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  };
  return {
    predict: (photo, options) => request(photo, options),
    checkInput: (photo, options) => request(photo, options, true),
  };
};

module.exports = { ...createInferenceClient(), createInferenceClient };
