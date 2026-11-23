const fs = require("node:fs/promises");
const path = require("node:path");
const { isDeepStrictEqual } = require("node:util");
const AppError = require("../utils/app-error");
const getDiagnosisConfig = (env = process.env, { identification = false } = {}) => {
  try {
    const url = new URL(env.DIAGNOSIS_INFERENCE_URL || "http://127.0.0.1:8001");
    const timeoutMs = Number(env.DIAGNOSIS_TIMEOUT_MS || 20000);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !Number.isInteger(timeoutMs) ||
      timeoutMs < 1000 ||
      timeoutMs > 60000
    )
      throw new Error();
    const score = (key) => {
      const value = env[key];
      const number =
        typeof value === "string" && value.trim() ? Number(value) : NaN;
      if (!Number.isFinite(number) || number < 0 || number > 1)
        throw new Error();
      return number;
    };
    const prefix = identification ? "IDENTIFICATION" : "DIAGNOSIS";
    const thresholds = {
      min_confidence: score(`${prefix}_MIN_CONFIDENCE`),
      min_margin: score(`${prefix}_MIN_MARGIN`),
      unrecognized_below: score(`${prefix}_UNRECOGNIZED_BELOW`),
    };
    if (
      thresholds.min_confidence <= 0 ||
      thresholds.unrecognized_below >= thresholds.min_confidence
    )
      throw new Error();
    const guard = env.DIAGNOSIS_REQUIRE_INPUT_GUARD;
    if (guard !== undefined && !["true", "false"].includes(guard))
      throw new Error();
    const inputGuard =
      guard === "true"
        ? {
            minSimilarity: score("DIAGNOSIS_GUARD_MIN_SIMILARITY"),
            minMargin: score("DIAGNOSIS_GUARD_MIN_MARGIN"),
          }
        : null;
    if (
      inputGuard &&
      (inputGuard.minSimilarity <= 0 || inputGuard.minMargin <= 0)
    )
      throw new Error();
    return {
      thresholds,
      inputGuard,
      requireInputGuard: guard === "true",
      inferenceUrl: `${url.toString().replace(/\/$/, "")}/predict`,
      timeoutMs,
    };
  } catch {
    throw new AppError(
      "DIAGNOSIS_NOT_CONFIGURED",
      503,
      "Dịch vụ nhận diện chưa có cấu hình kết nối hoặc ngưỡng hợp lệ.",
    );
  }
};

// Keep class order and checkpoint identity independent of business catalog data.
const loadModelMetadata = async () => {
  try {
    const root =
      process.env.DIAGNOSIS_MODEL_BUNDLE_DIR ||
      path.resolve(__dirname, "../../../inference/model");
    const read = async (file) =>
      JSON.parse(await fs.readFile(path.join(root, file), "utf8"));
    const [summary, sidecar, mapping] = await Promise.all([
      read("run_summary.json"),
      read("checkpoint_metadata.json"),
      read("metadata/class_mapping.json"),
    ]);
    const checkpoint = "best_macro_f1.pt";
    const selected = summary.checkpoints?.[checkpoint];
    if (
      summary.status !== "COMPLETED" ||
      summary.task !== "classify" ||
      typeof summary.model !== "string" ||
      !summary.model.trim() ||
      typeof summary.run_id !== "string" ||
      !/^[\w.-]{1,160}$/.test(summary.run_id) ||
      !Number.isInteger(summary.classes) ||
      summary.classes < 5 ||
      !Number.isInteger(summary.image_size) ||
      summary.image_size < 1 ||
      !Number.isInteger(summary.epochs_completed) ||
      summary.epochs_completed < 1 ||
      !selected ||
      selected.run_id !== summary.run_id ||
      !Number.isInteger(selected.epoch) ||
      selected.epoch < 1 ||
      selected.epoch > summary.epochs_completed ||
      !/^[a-f0-9]{64}$/.test(selected.sha256) ||
      !isDeepStrictEqual(sidecar[checkpoint], selected) ||
      !Array.isArray(mapping) ||
      mapping.length !== summary.classes ||
      mapping.some(
        (x, i) =>
          x.model_id !== i ||
          x.source_id !== i ||
          typeof x.original_name !== "string" ||
          !x.original_name.trim() ||
          typeof x.healthy !== "boolean",
      )
    )
      throw new Error("Invalid checkpoint metadata");
    return {
      run_id: summary.run_id,
      name: summary.model,
      checkpoint,
      checkpoint_epoch: selected.epoch,
      epochs_completed: summary.epochs_completed,
      sha256: selected.sha256,
      classes: summary.classes,
      image_size: summary.image_size,
      labels: mapping.map((x) => ({
        class_id: x.model_id,
        class_name: x.original_name,
        is_healthy: x.healthy,
      })),
    };
  } catch {
    throw new AppError(
      "DIAGNOSIS_NOT_CONFIGURED",
      503,
      "Metadata checkpoint chưa hợp lệ hoặc không đọc được.",
    );
  }
};

module.exports = { getDiagnosisConfig, loadModelMetadata };
