const AppError = require("../../utils/app-error");
const inference = require("./diagnosis.service");

// Model Python kiểm tra bytes ảnh; không suy ra phạm vi từ tên file hay điểm bệnh.
const createInputGuard = ({ client = inference } = {}) => ({
  async check(photo, { enabled = false, ...options } = {}) {
    if (!enabled)
      return { status: "disabled", reason: "not_configured", active: false };
    const result = await client.checkInput(photo, options);
    const scores = result?.scores;
    if (
      !result ||
      result.active !== true ||
      !["passed", "unsupported", "uncertain"].includes(result.status) ||
      typeof result.reason !== "string" ||
      !result.reason.trim() ||
      !scores ||
      ![scores.positive, scores.negative].every(
        (x) => Number.isFinite(x) && x >= -1 && x <= 1,
      ) ||
      !Number.isFinite(scores.margin) ||
      Math.abs(scores.margin - (scores.positive - scores.negative)) > 1e-6 ||
      typeof result.model?.name !== "string" ||
      !/^[a-f0-9]{40}$/.test(result.model?.revision) ||
      !/^[a-f0-9]{64}$/.test(result.model?.sha256) ||
      !/^[a-f0-9]{64}$/.test(result.model?.prompts_sha256) ||
      typeof result.model?.calibrated !== "boolean"
    ) {
      throw new AppError(
        "DIAGNOSIS_INPUT_GUARD_UNAVAILABLE",
        503,
        "Dịch vụ kiểm tra ảnh trả kết quả không hợp lệ.",
      );
    }
    return result;
  },
});

module.exports = { ...createInputGuard(), createInputGuard };
