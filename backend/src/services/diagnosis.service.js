const mongoose = require("mongoose");
const AppError = require("../utils/app-error");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const DiagnosisMapping = require("../models/diagnosisMapping.model");
const treatment = require("./treatment.service");
const DiseaseDiagnosis = require("../models/diseaseDiagnosis.model");
const inference = require("../integrations/ai/diagnosis.service");
const inputGuard = require("../integrations/ai/input-guard.service");
const { getDiagnosisConfig, loadModelMetadata } = require("../config/diagnosis");
const validate = require("../validators/common");
const diagnosisPhotos = require("../integrations/diagnosis-photo.service");

// Mục đích: Tạo lỗi kết quả model không hợp lệ.
// Cách chạy: Trả AppError 502 khi dữ liệu không khớp hợp đồng hoặc taxonomy.
const invalidResponse = () =>
  new AppError(
    "DIAGNOSIS_INVALID_RESPONSE",
    502,
    "Kết quả model không khớp bộ nhãn đã cấu hình. Vui lòng thử lại.",
  );
const qualityReasons = new Set([
  "too_small",
  "too_dark",
  "too_bright",
  "low_detail",
]);

// Mục đích: Xác minh kết quả raw từ Python.
// Cách chạy: Kiểm tra top 5, nhãn, điểm, chất lượng ảnh và metadata trước khi sử dụng.
const validateResult = (data, metadata) => {
  const taxonomy = metadata.labels;
  if (
    !data ||
    !Array.isArray(data.top5) ||
    data.top5.length !== 5 ||
    !data.prediction ||
    !data.image ||
    !Number.isInteger(data.image.width) ||
    !Number.isInteger(data.image.height) ||
    data.image.width <= 0 ||
    data.image.height <= 0 ||
    data.image.width * data.image.height > 25000000 ||
    !Number.isFinite(data.processing_ms) ||
    data.processing_ms < 0
  )
    throw invalidResponse();
  const ids = new Set();
  let previous = Infinity;
  let sum = 0;
  for (const candidate of data.top5) {
    if (
      !candidate ||
      !Number.isInteger(candidate.class_id) ||
      candidate.class_id < 0 ||
      candidate.class_id >= metadata.classes ||
      ids.has(candidate.class_id) ||
      !Number.isFinite(candidate.confidence) ||
      candidate.confidence < 0 ||
      candidate.confidence > 1 ||
      candidate.confidence > previous + 1e-8
    )
      throw invalidResponse();
    const entry = taxonomy[candidate.class_id];
    if (
      !entry ||
      entry.class_id !== candidate.class_id ||
      entry.class_name !== candidate.class_name ||
      entry.is_healthy !== candidate.is_healthy
    )
      throw invalidResponse();
    ids.add(candidate.class_id);
    previous = candidate.confidence;
    sum += candidate.confidence;
  }
  if (
    sum > 1.001 ||
    data.prediction.class_id !== data.top5[0].class_id ||
    data.prediction.class_name !== data.top5[0].class_name ||
    data.prediction.is_healthy !== data.top5[0].is_healthy ||
    data.prediction.confidence !== data.top5[0].confidence
  )
    throw invalidResponse();
  const model = data.model;
  if (
    !model ||
    model.name !== metadata.name ||
    model.checkpoint !== metadata.checkpoint ||
    model.run_id !== metadata.run_id ||
    model.checkpoint_epoch !== metadata.checkpoint_epoch ||
    model.epochs_completed !== metadata.epochs_completed ||
    model.sha256 !== metadata.sha256 ||
    model.classes !== metadata.classes ||
    model.image_size !== metadata.image_size ||
    typeof model.run_id !== "string" ||
    !/^[a-zA-Z0-9_.-]{1,160}$/.test(model.run_id) ||
    !Number.isInteger(model.checkpoint_epoch) ||
    !Number.isInteger(model.epochs_completed) ||
    model.checkpoint_epoch < 1 ||
    model.checkpoint_epoch > model.epochs_completed ||
    !["cpu", "0"].includes(model.device)
  )
    throw invalidResponse();
  const quality = data.image.quality;
  if (
    !quality ||
    typeof quality.usable !== "boolean" ||
    !Array.isArray(quality.reasons) ||
    quality.reasons.some((reason) => !qualityReasons.has(reason)) ||
    (quality.usable && quality.reasons.length > 0) ||
    (!quality.usable && quality.reasons.length === 0)
  )
    throw invalidResponse();
  return data;
};

const toCandidate = (raw) => ({
  class_id: raw.class_id,
  class_name: raw.class_name,
  is_healthy: raw.is_healthy,
  confidence: raw.confidence,
  display_name: null,
  plant_name: null,
  disease_name: null,
  plant_id: null,
  disease_id: null,
  symptoms: null,
  care_advice: null,
});

const careLabels = {
  light: "Ánh sáng",
  water: "Tưới nước",
  temperature: "Nhiệt độ",
  humidity: "Độ ẩm",
  soil: "Đất trồng",
  fertilizer: "Phân bón",
};
// Mục đích: Tạo nội dung chăm sóc từ danh mục.
// Cách chạy: Lấy các trường chuỗi có nội dung, gắn nhãn tiếng Việt rồi nối thành các dòng.
const careText = (requirements) =>
  Object.entries(careLabels)
    .filter(
      ([key]) =>
        typeof requirements?.[key] === "string" && requirements[key].trim(),
    )
    .map(
      ([key, label]) => `${label}: ${requirements[key].trim().slice(0, 1000)}`,
    )
    .join("\n") || null;
const hasText = value => typeof value === "string" && value.trim().length > 0;
// Chỉ dùng mapping DB đúng phiên bản; thiếu dữ liệu là lỗi danh mục, không phải uncertain.
const createCatalogEnricher = ({
  plantModel = Plant,
  diseaseModel = Disease,
  mappingModel = DiagnosisMapping,
  protocolProvider = treatment.hasApprovedProtocol,
} = {}) => async (candidate, entry, model) => {
  if (!model?.run_id || !model.sha256) throw new AppError("DIAGNOSIS_NOT_CONFIGURED", 503,
    "Chưa có metadata model hợp lệ để đọc mapping.");
  try {
    const mapping = await mappingModel.findOne({
      model_run_id: model.run_id,
      checkpoint_sha256: model.sha256,
      class_id: entry.class_id,
    }).select("class_id class_name is_healthy plant_id disease_id status").lean();
    if (!mapping) throw new AppError("DIAGNOSIS_MAPPING_MISSING", 503,
      "Danh mục chưa có mapping cho nhãn dự đoán của checkpoint đang chạy.");
    if (mapping.status === "pending") throw new AppError("DIAGNOSIS_MAPPING_PENDING", 409,
      "Mapping cây/bệnh cho nhãn dự đoán đang chờ đối chiếu dữ liệu.");
    if (mapping.status !== "ready" || mapping.class_id !== entry.class_id ||
        mapping.class_name !== entry.class_name || mapping.is_healthy !== entry.is_healthy ||
        !mongoose.isObjectIdOrHexString(mapping.plant_id) ||
        (entry.is_healthy ? mapping.disease_id !== null : !mongoose.isObjectIdOrHexString(mapping.disease_id))) {
      throw new AppError("DIAGNOSIS_MAPPING_INVALID", 503,
        "Mapping cây/bệnh không hợp lệ với metadata checkpoint.");
    }
    const [plant, disease] = await Promise.all([
      plantModel.findOne({ _id: mapping.plant_id, is_published: true })
        .select("_id common_name common_disease_ids care_requirements").lean(),
      entry.is_healthy ? null : diseaseModel.findOne({ _id: mapping.disease_id, status: "active" })
        .select("_id catalog_key identity_sources content_status disease_name scientific_name diagnosis_aliases pathogen_type typical_symptoms environmental_cause disease_image_url status treatment_protocol created_at __v").lean(),
    ]);
    if (!hasText(plant?.common_name) || (!entry.is_healthy &&
        (!hasText(disease?.disease_name) || !Array.isArray(plant.common_disease_ids) ||
          !plant.common_disease_ids.some(id => String(id) === String(disease._id))))) {
      throw new AppError("DIAGNOSIS_CATALOG_INCOMPLETE", 503,
        "Danh mục cây/bệnh đã bị ẩn, thiếu nội dung định danh hoặc thiếu liên kết hợp lệ.");
    }
    const treatmentAvailable = disease
      ? await protocolProvider(String(disease._id), String(plant._id)) : false;
    return {
      ...candidate,
      plant_id: String(plant._id), plant_name: plant.common_name,
      disease_id: disease ? String(disease._id) : null, disease_name: disease?.disease_name || null,
      display_name: disease ? `${plant.common_name} - ${disease.disease_name}` : plant.common_name,
      symptoms: disease?.content_status === "verified" ? disease.typical_symptoms || null : null,
      content_status: disease?.content_status || "unverified",
      disease_details: disease ? {
        ...disease,
        _id: String(disease._id),
      } : null,
      treatment_available: treatmentAvailable,
      care_advice: careText(plant.care_requirements),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("DIAGNOSIS_CATALOG_UNAVAILABLE", 503,
      "Không đọc được danh mục hoặc phác đồ từ database. Vui lòng thử lại sau.");
  }
};

const messages = {
  confident: "Model gợi ý kết quả bên dưới. Hãy đối chiếu với tình trạng thực tế của cây.",
  low_confidence: "Chưa đủ cơ sở để xác định cây hoặc bệnh. Vui lòng chụp rõ lá cây và thử lại.",
  ambiguous: "Kết quả còn phân vân giữa nhiều nhóm cây/bệnh. Vui lòng chụp rõ vùng có triệu chứng và thử lại.",
  poor_image_quality: "Ảnh quá nhỏ, quá tối/sáng hoặc thiếu chi tiết. Vui lòng chụp lại ảnh rõ hơn.",
};

const decideResult = (data, thresholds) => {
  const top1 = data.top5[0].confidence;
  const margin = top1 - data.top5[1].confidence;
  if (!data.image.quality.usable) return { status: "unrecognized", reason: "poor_image_quality" };
  if (top1 < thresholds.unrecognized_below) return { status: "unrecognized", reason: "low_confidence" };
  if (margin + 1e-9 < thresholds.min_margin) return { status: "uncertain", reason: "ambiguous" };
  if (top1 < thresholds.min_confidence) return { status: "uncertain", reason: "low_confidence" };
  return { status: "identified", reason: "confident" };
};

// Pending bệnh vẫn có thể nhận diện cây khi plant_id đã xác định; không suy tên cây từ nhãn.
const createPlantIdentifier = ({ mappingModel = DiagnosisMapping, plantModel = Plant } = {}) => async (data, metadata, thresholds) => {
  const scores = data.class_scores;
  if (!Array.isArray(scores) || scores.length !== metadata.classes ||
      scores.some(score => !Number.isFinite(score) || score < 0 || score > 1) ||
      Math.abs(scores.reduce((sum, score) => sum + score, 0) - 1) > 1e-4 ||
      data.top5.some(candidate => Math.abs(scores[candidate.class_id] - candidate.confidence) > 1e-7) ||
      scores.some((score, id) => !data.top5.some(candidate => candidate.class_id === id) && score > data.top5[4].confidence + 1e-7))
    throw invalidResponse();
  if (!data.image.quality.usable) return {
    status: "unrecognized", result_kind: "plant", result_status: "uncertain", reason: "poor_image_quality",
    prediction: null, alternatives: [], message: messages.poor_image_quality,
  };
  let mappings, plants;
  try {
    mappings = await mappingModel.find({ model_run_id: metadata.run_id, checkpoint_sha256: metadata.sha256 })
      .select("class_id class_name is_healthy plant_id status").lean();
    if (mappings.length !== metadata.classes) throw new AppError("DIAGNOSIS_MAPPING_MISSING", 503,
      "Chưa đủ mapping của checkpoint để tổng hợp điểm nhận diện cây.");
    const ids = new Set();
    for (const mapping of mappings) {
      const entry = metadata.labels[mapping.class_id];
      if (!entry || !Number.isInteger(mapping.class_id) || ids.has(mapping.class_id) || mapping.class_name !== entry.class_name ||
          mapping.is_healthy !== entry.is_healthy || !["ready", "pending"].includes(mapping.status))
        throw new AppError("DIAGNOSIS_MAPPING_INVALID", 503, "Mapping cây không khớp checkpoint.");
      if (!mongoose.isObjectIdOrHexString(mapping.plant_id))
        throw new AppError("DIAGNOSIS_MAPPING_PENDING", 409, "Cây của một số nhãn đang chờ đối chiếu.");
      ids.add(mapping.class_id);
    }
    const plantIds = [...new Set(mappings.map(mapping => String(mapping.plant_id)))];
    plants = await plantModel.find({ _id: { $in: plantIds }, is_published: true })
      .select("_id common_name scientific_name").lean();
    if (plants.length !== plantIds.length || plants.some(plant => !hasText(plant.common_name) ||
        (plant.scientific_name != null && typeof plant.scientific_name !== "string")))
      throw new AppError("DIAGNOSIS_CATALOG_INCOMPLETE", 503, "Danh mục cây chưa đầy đủ hoặc đã bị ẩn.");
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("DIAGNOSIS_CATALOG_UNAVAILABLE", 503, "Không đọc được thông tin cây từ database.");
  }
  const grouped = new Map(plants.map(plant => [String(plant._id), {
    plant_id: String(plant._id), plant_name: plant.common_name, display_name: plant.common_name,
    scientific_name: plant.scientific_name || null, confidence: 0,
  }]));
  for (const mapping of mappings) grouped.get(String(mapping.plant_id)).confidence += scores[mapping.class_id];
  for (const plant of grouped.values()) plant.confidence = Math.min(1, plant.confidence);
  const ranked = [...grouped.values()].sort((a, b) => b.confidence - a.confidence || a.plant_id.localeCompare(b.plant_id));
  const top1 = ranked[0].confidence, top2 = ranked[1]?.confidence || 0;
  const decision = decideResult({ image: data.image, top5: [{ confidence: top1 }, { confidence: top2 }] }, thresholds);
  return { ...decision, result_kind: "plant", result_status: decision.status === "identified" ? "accepted" : "uncertain",
    prediction: decision.status === "identified" ? ranked[0] : null, alternatives: ranked.slice(0, 5),
    scores: { top1, top2, margin: top1 - top2 },
    message: decision.status === "identified" ? "Tên cây gợi ý từ mô hình. Hãy đối chiếu với cây thực tế."
      : decision.reason === "poor_image_quality" ? messages.poor_image_quality
      : "Chưa đủ cơ sở để xác định cây. Vui lòng chụp rõ cây hoặc lá và thử lại.",
  };
};
const checkCancellation = signal => {
  if (signal?.aborted) throw new AppError("REQUEST_ABORTED", 499, "Yêu cầu đã được hủy.");
};

const historyItem = row => ({
  _id: String(row._id), created_at: row.created_at || null, status: row.status,
  plant_id: row.plant_id ? String(row.plant_id._id) : null,
  plant_name: row.plant_id?.common_name || null,
  disease_id: row.disease_id ? String(row.disease_id._id) : null,
  disease_name: row.disease_id?.disease_name || null,
  has_image: row.image?.storage === "cloudinary" ? !!(row.image.public_id && row.image.asset_id) : !!row.image?.filename,
});
const historyCatalog = [
  { path: "plant_id", select: "common_name", match: { is_published: true } },
  { path: "disease_id", select: "disease_name", match: { status: "active" } },
];

const createDiagnosisService = ({
  guard = inputGuard,
  predictor = inference,
  enrich = createCatalogEnricher(),
  identifyPlant = createPlantIdentifier(),
  metadataProvider = loadModelMetadata,
  configProvider = getDiagnosisConfig,
  diagnosisModel = DiseaseDiagnosis,
  photoStorage = diagnosisPhotos,
} = {}) => ({
  async history(userId, input = {}) {
    validate.id(userId, "user_id");
    validate.object(input, "query");
    const page = validate.positiveInteger(input.page, 1, "page");
    const limit = validate.positiveInteger(input.limit, 20, "limit", 100);
    if (!Number.isSafeInteger((page - 1) * limit)) validate.invalid("page");
    const filter = { user_id: userId, status: "identified" };
    try {
      const [rows, total] = await Promise.all([
        diagnosisModel.find(filter).sort({ created_at: -1, _id: -1 })
          .skip((page - 1) * limit).limit(limit)
          .select("plant_id disease_id status created_at image")
          .populate(historyCatalog).lean(),
        diagnosisModel.countDocuments(filter),
      ]);
      return {
        diagnoses: rows.map(historyItem),
        page, limit, total, totalPages: Math.ceil(total / limit),
      };
    } catch {
      throw new AppError("DIAGNOSIS_HISTORY_LOAD_FAILED", 503, "Không thể tải lịch sử chẩn đoán. Vui lòng thử lại.");
    }
  },
  async historyDetail(userId, diagnosisId) {
    validate.id(userId, "user_id"); validate.id(diagnosisId, "diagnosis_id");
    try {
      const row = await diagnosisModel.findOne({ _id: diagnosisId, user_id: userId, status: "identified" })
        .select("plant_id disease_id status created_at image confidence").populate(historyCatalog).lean();
      if (!row) throw new AppError("DIAGNOSIS_HISTORY_NOT_FOUND", 404, "Không tìm thấy chẩn đoán này trong lịch sử của bạn.");
      return { ...historyItem(row), confidence: row.confidence };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("DIAGNOSIS_HISTORY_LOAD_FAILED", 503, "Không thể tải chi tiết chẩn đoán.");
    }
  },
  async historyImage(userId, diagnosisId) {
    validate.id(userId, "user_id"); validate.id(diagnosisId, "diagnosis_id");
    try {
      const row = await diagnosisModel.findOne({ _id: diagnosisId, user_id: userId, status: "identified" })
        .select("image").lean();
      if (!row) throw new AppError("DIAGNOSIS_HISTORY_NOT_FOUND", 404, "Không tìm thấy chẩn đoán này trong lịch sử của bạn.");
      return await photoStorage.read(row.image);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("DIAGNOSIS_HISTORY_LOAD_FAILED", 503, "Không thể tải ảnh chẩn đoán.");
    }
  },
  async diagnose(photo, options = {}) {
    checkCancellation(options.signal);
    const config = configProvider(process.env, { identification: options.identification === true });
    const metadata = await metadataProvider();
    checkCancellation(options.signal);
    const inputCheck = await guard.check(photo, { ...options, config, enabled: config.requireInputGuard });
    if (!inputCheck || typeof inputCheck.reason !== "string" || !inputCheck.reason.trim() ||
        !["passed", "disabled", "unsupported", "uncertain"].includes(inputCheck.status) ||
        (config.requireInputGuard && inputCheck.status === "disabled") ||
        (inputCheck.status === "disabled" ? inputCheck.active !== false : inputCheck.active !== true)) {
      throw new AppError("DIAGNOSIS_INPUT_GUARD_UNAVAILABLE", 503,
        "Bộ kiểm tra đầu vào chưa trả được trạng thái hợp lệ.");
    }
    checkCancellation(options.signal);
    if (["unsupported", "uncertain"].includes(inputCheck.status)) return {
      status: inputCheck.status === "unsupported" ? "unrecognized" : "uncertain",
      result_status: inputCheck.status === "unsupported" ? "unsupported_image" : "uncertain",
      reason: inputCheck.reason,
      message: inputCheck.status === "unsupported"
        ? "Ảnh không phù hợp hoặc cây nằm ngoài phạm vi hỗ trợ."
        : "Chưa đủ cơ sở để xác định cây hoặc bệnh. Vui lòng chụp rõ lá cây và thử lại.",
      prediction: null, alternatives: [], diagnosis_id: null, input_check: inputCheck,
      result_kind: options.identification === true ? "plant" : "disease",
    };
    const data = validateResult(await predictor.predict(photo, { ...options, config }), metadata);
    checkCancellation(options.signal);
    const details = {
      result_kind: options.identification === true ? "plant" : "disease",
      input_check: inputCheck, thresholds: { ...config.thresholds },
      image: { width: data.image.width, height: data.image.height,
        quality: { usable: data.image.quality.usable, reasons: data.image.quality.reasons } },
      model: { name: data.model.name, run_id: data.model.run_id, sha256: data.model.sha256,
        checkpoint: data.model.checkpoint, checkpoint_epoch: data.model.checkpoint_epoch,
        epochs_completed: data.model.epochs_completed, classes: data.model.classes,
        image_size: data.model.image_size, device: data.model.device },
      processing_ms: data.processing_ms, diagnosis_id: null,
    };
    if (options.identification === true) {
      const result = await identifyPlant(data, metadata, config.thresholds);
      checkCancellation(options.signal);
      return { ...details, ...result };
    }
    const decision = decideResult(data, config.thresholds);
    const accepted = decision.status === "identified";
    const alternatives = data.top5.map(toCandidate);
    const prediction = accepted ? await enrich(alternatives[0], metadata.labels[data.prediction.class_id], metadata) : null;
    if (accepted && !prediction) throw new AppError("DIAGNOSIS_MAPPING_INVALID", 503,
      "Mapping chưa trả được thông tin cây/bệnh hợp lệ.");
    if (prediction) alternatives[0] = prediction;
    const result = {
      ...decision,
      result_status: accepted ? "accepted" : "uncertain",
      message: messages[decision.reason], prediction, alternatives,
      ...details,
      scores: { top1: data.top5[0].confidence, top2: data.top5[1].confidence,
        margin: data.top5[0].confidence - data.top5[1].confidence },
    };
    checkCancellation(options.signal);
    // Giữ lịch sử hiện có: chỉ chẩn đoán bệnh accepted có tài khoản mới tạo evidence.
    if (options.userId && accepted && !prediction.is_healthy) {
      let savedPhoto;
      try {
        savedPhoto = await photoStorage.save(photo);
        checkCancellation(options.signal);
        const saved = await diagnosisModel.create({
          user_id: options.userId, plant_id: prediction.plant_id, disease_id: prediction.disease_id,
          class_id: prediction.class_id, class_name: prediction.class_name, confidence: prediction.confidence,
          status: "identified",
          model: { sha256: data.model.sha256, name: data.model.name, run_id: data.model.run_id,
            checkpoint: data.model.checkpoint, checkpoint_epoch: data.model.checkpoint_epoch },
          image: { width: data.image.width, height: data.image.height, ...savedPhoto }, processing_ms: data.processing_ms,
        });
        result.diagnosis_id = String(saved._id);
      } catch (error) {
        if (savedPhoto) await photoStorage.remove(savedPhoto).catch(() => console.error("[Diagnosis] Không dọn được ảnh chưa lưu lịch sử."));
        if (["REQUEST_ABORTED", "DIAGNOSIS_PHOTO_NOT_CONFIGURED", "DIAGNOSIS_PHOTO_STORAGE_UNAVAILABLE"].includes(error.code)) throw error;
        throw new AppError("DIAGNOSIS_HISTORY_UNAVAILABLE", 503,
          "Chưa lưu được kết quả chẩn đoán; chưa thể dùng kết quả này để điều trị. Vui lòng thử lại sau.");
      }
    }
    return result;
  },
});

module.exports = { ...createDiagnosisService(), createDiagnosisService, createCatalogEnricher,
  validateResult, decideResult, createPlantIdentifier };
