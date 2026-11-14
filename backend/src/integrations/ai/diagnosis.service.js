const AppError = require("../../utils/app-error");
const { getDiagnosisConfig } = require("../../config/diagnosis");

// Mục đích: Tạo lỗi dịch vụ model chưa sẵn sàng.
// Cách chạy: Trả AppError 503 để mobile có thể báo thử lại sau.
const unavailable = () => new AppError(
  "DIAGNOSIS_UNAVAILABLE", 503,
  "Dịch vụ nhận diện chưa sẵn sàng. Vui lòng thử lại sau.",
);
// Mục đích: Tạo lỗi dữ liệu trả về từ Python.
// Cách chạy: Trả AppError 502 khi response sai cấu trúc hoặc vượt giới hạn.
const invalidResponse = () => new AppError(
  "DIAGNOSIS_INVALID_RESPONSE", 502,
  "Dịch vụ nhận diện trả kết quả không hợp lệ. Vui lòng thử lại.",
);

// Mục đích: Đọc response Python với giới hạn dung lượng.
// Cách chạy: Đếm bytes khi đọc và từ chối nội dung lớn hơn 64 KiB.
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

// Mục đích: Tạo bộ gọi HTTP tới Python.
// Cách chạy: Nhận hàm fetch để dùng khi chạy thật hoặc thay thế trong kiểm thử.
const createInferenceClient = ({ fetchImpl = globalThis.fetch } = {}) => ({
  // Mục đích: Gửi ảnh tới dịch vụ model.
  // Cách chạy: Tạo multipart photo, áp dụng timeout/hủy request rồi chuẩn hóa response và lỗi.
  async predict(photo, { signal, config = getDiagnosisConfig() } = {}) {
    const controller = new AbortController();
    let timedOut = false;
    // Mục đích: Dừng request HTTP tới Python.
    // Cách chạy: Hủy AbortController nội bộ khi nhận tín hiệu từ request bên ngoài.
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    signal?.addEventListener("abort", abort, { once: true });
    // Mục đích: Giới hạn thời gian chờ Python.
    // Cách chạy: Đánh dấu timeout và hủy request khi hết thời gian cấu hình.
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
