const AppError = require("../utils/app-error");

const invalid = () => new AppError(
  "DIAGNOSIS_NOT_CONFIGURED", 503,
  "Cấu hình dịch vụ chẩn đoán chưa hợp lệ. Vui lòng liên hệ quản trị viên.",
);

const number = (env, key, fallback, min, max) => {
  if (env[key] === undefined) return fallback;
  if (typeof env[key] !== "string" || !env[key].trim()) throw invalid();
  const value = Number(env[key]);
  if (!Number.isFinite(value) || value < min || value > max) throw invalid();
  return value;
};

const getDiagnosisConfig = (env = process.env) => {
  const minConfidence = number(env, "DIAGNOSIS_MIN_CONFIDENCE", 0.7, 0, 1);
  const minMargin = number(env, "DIAGNOSIS_MIN_MARGIN", 0.15, 0, 1);
  const unrecognizedBelow = number(env, "DIAGNOSIS_UNRECOGNIZED_BELOW", 0.35, 0, 1);
  const timeoutMs = number(env, "DIAGNOSIS_TIMEOUT_MS", 20000, 1000, 60000);
  if (unrecognizedBelow >= minConfidence || !Number.isInteger(timeoutMs)) throw invalid();
  let inferenceUrl;
  try {
    const url = new URL(env.DIAGNOSIS_INFERENCE_URL || "http://127.0.0.1:8001");
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash)
      throw invalid();
    inferenceUrl = `${url.toString().replace(/\/$/, "")}/predict`;
  } catch { throw invalid(); }
  return {
    inferenceUrl, timeoutMs,
    thresholds: {
      min_confidence: minConfidence, min_margin: minMargin,
      unrecognized_below: unrecognizedBelow, calibrated: false,
    },
  };
};

module.exports = { getDiagnosisConfig };
