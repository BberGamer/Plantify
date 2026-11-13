const AppError = require("../utils/app-error");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const classes = require("../config/diagnosis-classes.json");
const inference = require("../integrations/ai/diagnosis.service");
const { getDiagnosisConfig } = require("../config/diagnosis");

const invalidResponse = () => new AppError(
  "DIAGNOSIS_INVALID_RESPONSE", 502,
  "Kết quả model không khớp bộ nhãn đã cấu hình. Vui lòng thử lại.",
);
const normalize = (value) => value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const validId = (id) => Number.isInteger(id) && id >= 0 && id < 78;
const qualityReasons = new Set(["too_small", "too_dark", "too_bright", "low_detail"]);

const validateResult = (data, taxonomy = classes) => {
  if (!data || !Array.isArray(data.top5) || data.top5.length !== 5 || !data.prediction ||
      !data.image || !Number.isInteger(data.image.width) || !Number.isInteger(data.image.height) ||
      data.image.width <= 0 || data.image.height <= 0 || data.image.width * data.image.height > 25000000 ||
      !Number.isFinite(data.processing_ms) || data.processing_ms < 0) throw invalidResponse();
  const ids = new Set();
  let previous = Infinity;
  let sum = 0;
  for (const candidate of data.top5) {
    if (!candidate || !validId(candidate.class_id) || ids.has(candidate.class_id) ||
        !Number.isFinite(candidate.confidence) || candidate.confidence < 0 || candidate.confidence > 1 ||
        candidate.confidence > previous + 1e-8) throw invalidResponse();
    const entry = taxonomy[candidate.class_id];
    if (!entry || entry.class_id !== candidate.class_id || entry.class_name !== candidate.class_name ||
        entry.is_healthy !== candidate.is_healthy) throw invalidResponse();
    ids.add(candidate.class_id);
    previous = candidate.confidence;
    sum += candidate.confidence;
  }
  if (sum > 1.001 || data.prediction.class_id !== data.top5[0].class_id ||
      data.prediction.class_name !== data.top5[0].class_name ||
      data.prediction.is_healthy !== data.top5[0].is_healthy ||
      data.prediction.confidence !== data.top5[0].confidence) throw invalidResponse();
  const model = data.model;
  if (!model || model.name !== "yolo26m-cls.pt" || model.checkpoint !== "best_macro_f1.pt" ||
      model.classes !== 78 || model.image_size !== 384 ||
      typeof model.run_id !== "string" || !/^[a-zA-Z0-9_.-]{1,160}$/.test(model.run_id) ||
      !Number.isInteger(model.checkpoint_epoch) || !Number.isInteger(model.epochs_completed) ||
      model.checkpoint_epoch < 1 || model.checkpoint_epoch > model.epochs_completed ||
      !["cpu", "0"].includes(model.device)) throw invalidResponse();
  const quality = data.image.quality;
  if (!quality || typeof quality.usable !== "boolean" ||
      !Array.isArray(quality.reasons) || quality.reasons.some((reason) => !qualityReasons.has(reason)) ||
      (quality.usable && quality.reasons.length > 0) || (!quality.usable && quality.reasons.length === 0))
    throw invalidResponse();
  return data;
};

const toCandidate = (raw, taxonomy = classes) => {
  const entry = taxonomy[raw.class_id];
  return {
    class_id: raw.class_id, class_name: entry.class_name, display_name: entry.display_name,
    plant_name: entry.plant_name, disease_name: entry.disease_name, is_healthy: entry.is_healthy,
    confidence: raw.confidence, plant_id: null, disease_id: null, symptoms: null, care_advice: null,
  };
};

const careLabels = {
  light: "Ánh sáng", water: "Tưới nước", temperature: "Nhiệt độ",
  humidity: "Độ ẩm", soil: "Đất trồng", fertilizer: "Phân bón",
};
const careText = (requirements) => Object.entries(careLabels)
  .filter(([key]) => typeof requirements?.[key] === "string" && requirements[key].trim())
  .map(([key, label]) => `${label}: ${requirements[key].trim().slice(0, 1000)}`)
  .join("\n") || null;
const exactAliases = (aliases) => Array.isArray(aliases)
  ? [...new Set(aliases.filter((x) => typeof x === "string" && x.trim()).map(normalize))]
  : [];
const aliasFilter = (aliases) => ({ $in: aliases.map((alias) => new RegExp(`^${escapeRegex(alias)}$`, "i")) });

const createCatalogEnricher = ({ plantModel = Plant, diseaseModel = Disease } = {}) => async (candidate, entry) => {
  const plantAliases = exactAliases(entry.plant_aliases);
  if (!plantAliases.length) return candidate;
  try {
    const plants = await plantModel.find({ is_published: true, common_name: aliasFilter(plantAliases) })
      .select("_id common_name common_disease_ids care_requirements").limit(2).maxTimeMS(1500).lean();
    if (plants.length !== 1 || !plantAliases.includes(normalize(plants[0].common_name))) return candidate;
    const plant = plants[0];
    const result = { ...candidate, plant_id: String(plant._id) };
    if (candidate.is_healthy) return { ...result, care_advice: careText(plant.care_requirements) };
    const diseaseAliases = exactAliases(entry.disease_aliases);
    if (!diseaseAliases.length || !plant.common_disease_ids?.length) return result;
    const diseases = await diseaseModel.find({
      _id: { $in: plant.common_disease_ids }, status: "active", disease_name: aliasFilter(diseaseAliases),
    }).select("_id disease_name typical_symptoms").limit(2).maxTimeMS(1500).lean();
    if (diseases.length !== 1 || !diseaseAliases.includes(normalize(diseases[0].disease_name))) return result;
    const disease = diseases[0];
    return { ...result, disease_id: String(disease._id),
      symptoms: typeof disease.typical_symptoms === "string" ? disease.typical_symptoms.slice(0, 5000) : null };
  } catch {
    throw new AppError("DIAGNOSIS_CATALOG_UNAVAILABLE", 503,
      "Chưa tải được thông tin cây/bệnh. Vui lòng thử lại sau.");
  }
};

const messages = {
  confident: "Model gợi ý kết quả bên dưới. Hãy đối chiếu với tình trạng thực tế của cây.",
  low_confidence: "Ảnh chưa đủ chắc chắn để kết luận. Hãy chụp gần, rõ vùng lá hoặc triệu chứng rồi thử lại.",
  ambiguous: "Model còn phân vân giữa nhiều nhóm cây/bệnh. Hãy chụp thêm một góc rõ triệu chứng.",
  unrecognized: "Chưa nhận diện được cây/bệnh từ ảnh này. Ảnh có thể chưa rõ hoặc nằm ngoài 78 nhóm đã huấn luyện.",
  poor_image_quality: "Ảnh quá nhỏ, quá tối/sáng hoặc thiếu chi tiết để phân tích. Hãy chụp lại một ảnh rõ hơn.",
};

const createDiagnosisService = ({
  predictor = inference, enrich = createCatalogEnricher(), taxonomy = classes, configProvider = getDiagnosisConfig,
} = {}) => ({
  async diagnose(photo, options = {}) {
    const config = configProvider();
    const data = validateResult(await predictor.predict(photo, { ...options, config }), taxonomy);
    const alternatives = data.top5.map((raw) => toCandidate(raw, taxonomy));
    const top = alternatives[0];
    const margin = top.confidence - alternatives[1].confidence;
    let status = "identified";
    let reason = "confident";
    let message = messages.confident;
    if (data.image.quality?.usable === false) {
      status = "unrecognized";
      reason = "poor_image_quality";
      message = messages.poor_image_quality;
    } else if (top.confidence < config.thresholds.unrecognized_below) {
      status = "unrecognized";
      reason = "low_confidence";
      message = messages.unrecognized;
    } else if (margin + 1e-9 < config.thresholds.min_margin) {
      status = "uncertain";
      reason = "ambiguous";
      message = messages.ambiguous;
    } else if (top.confidence < config.thresholds.min_confidence) {
      status = "uncertain";
      reason = "low_confidence";
      message = messages.low_confidence;
    }
    const prediction = status === "identified" ? await enrich(top, taxonomy[top.class_id]) : null;
    return {
      status, reason, message, prediction, alternatives,
      thresholds: { ...config.thresholds },
      image: { width: data.image.width, height: data.image.height,
        quality: { usable: data.image.quality.usable, reasons: data.image.quality.reasons } },
      model: { name: data.model.name, run_id: data.model.run_id, checkpoint: data.model.checkpoint,
        checkpoint_epoch: data.model.checkpoint_epoch, epochs_completed: data.model.epochs_completed,
        classes: data.model.classes, image_size: data.model.image_size, device: data.model.device },
      processing_ms: data.processing_ms,
    };
  },
});

module.exports = { ...createDiagnosisService(), createDiagnosisService, createCatalogEnricher, validateResult };
