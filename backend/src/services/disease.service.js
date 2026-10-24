const AppError = require("../utils/app-error");
// services/disease.service.js - Nghiệp vụ đọc danh mục bệnh cây
const mongoose = require("mongoose");
const Disease = require("../models/disease.model");
const Plant = require("../models/plant.model");

const DISEASE_STATUSES = ["active", "inactive"];
const PATHOGEN_TYPES = [
  "fungus",
  "bacteria",
  "virus",
  "pest",
  "nematode",
  "physiological",
  "other",
];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DISEASE_FIELDS = [
  "disease_name",
  "scientific_name",
  "pathogen_type",
  "typical_symptoms",
  "environmental_cause",
  "disease_image_url",
  "status",
  "treatment_protocol",
];

const createError = (message, statusCode) =>
  new AppError(
    statusCode === 404
      ? "RESOURCE_NOT_FOUND"
      : statusCode === 409
        ? "DUPLICATE_RESOURCE"
        : "VALIDATION_ERROR",
    statusCode,
    message,
  );

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback, fieldName, maximum) => {
  if (value === undefined || value === "") return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw createError(`${fieldName} phải là số nguyên dương.`, 400);
  }

  return maximum ? Math.min(parsed, maximum) : parsed;
};

const resolvePlantDiseaseIds = async (plantId, managerView) => {
  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    throw createError("Định dạng ID cây không hợp lệ.", 400);
  }

  const plantFilter = { _id: plantId };
  if (!managerView) plantFilter.is_published = true;

  const plant = await Plant.findOne(plantFilter)
    .select("common_disease_ids")
    .lean();
  if (!plant) throw createError("Không tìm thấy cây này.", 404);

  return plant.common_disease_ids || [];
};

const buildListFilter = async (query, managerView) => {
  const filter = managerView ? {} : { status: "active" };

  if (managerView && query.status) {
    if (
      typeof query.status !== "string" ||
      !DISEASE_STATUSES.includes(query.status)
    ) {
      throw createError("Trạng thái bệnh không hợp lệ.", 400);
    }
    filter.status = query.status;
  }

  if (query.search && typeof query.search !== "string") {
    throw createError("Từ khóa tìm kiếm không hợp lệ.", 400);
  }

  if (query.search?.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { disease_name: regex },
      { scientific_name: regex },
      { typical_symptoms: regex },
    ];
  }

  if (query.plant_id) {
    const diseaseIds = await resolvePlantDiseaseIds(
      query.plant_id,
      managerView,
    );
    filter._id = { $in: diseaseIds };
  }

  return filter;
};

const getDiseases = async (query = {}, managerView = false) => {
  const page = parsePositiveInteger(query.page, 1, "Trang");
  const limit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT,
    "Giới hạn",
    MAX_LIMIT,
  );
  const filter = await buildListFilter(query, managerView);
  const skip = (page - 1) * limit;

  const [diseases, total] = await Promise.all([
    Disease.find(filter)
      .sort({ disease_name: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Disease.countDocuments(filter),
  ]);

  return {
    diseases,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getDiseaseById = async (id, managerView = false) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError("Định dạng ID bệnh không hợp lệ.", 400);
  }

  const filter = { _id: id };
  if (!managerView) filter.status = "active";

  const disease = await Disease.findOne(filter).lean();
  if (!disease) throw createError("Không tìm thấy bệnh cây này.", 404);

  const plantFilter = { common_disease_ids: disease._id };
  if (!managerView) plantFilter.is_published = true;

  const plants = await Plant.find(plantFilter)
    .select("common_name scientific_name plant_image is_published")
    .sort({ common_name: 1 })
    .lean();

  return { ...disease, plants };
};

const normalizeDiseaseInput = (input = {}) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw createError("Dữ liệu bệnh cây không hợp lệ.", 400);
  }

  const requiredFields = ["disease_name", "typical_symptoms"];
  for (const field of requiredFields) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      const label =
        field === "disease_name" ? "Tên bệnh" : "Triệu chứng điển hình";
      throw createError(`${label} là bắt buộc.`, 400);
    }
  }

  if (!Array.isArray(input.plant_ids) || input.plant_ids.length === 0) {
    throw createError("Vui lòng chọn ít nhất một cây liên quan.", 400);
  }

  const plantIds = input.plant_ids.map((id) => {
    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      throw createError("Danh sách cây chứa ID không hợp lệ.", 400);
    }
    return id;
  });

  if (new Set(plantIds).size !== plantIds.length) {
    throw createError("Danh sách cây không được chứa ID trùng nhau.", 400);
  }

  const optionalStringFields = [
    "scientific_name",
    "environmental_cause",
    "disease_image_url",
  ];
  for (const field of optionalStringFields) {
    if (input[field] !== undefined && typeof input[field] !== "string") {
      throw createError(`Trường ${field} phải là chuỗi.`, 400);
    }
  }

  if (
    input.pathogen_type !== undefined &&
    !PATHOGEN_TYPES.includes(input.pathogen_type)
  ) {
    throw createError("Loại tác nhân gây bệnh không hợp lệ.", 400);
  }
  if (input.status !== undefined && !DISEASE_STATUSES.includes(input.status)) {
    throw createError("Trạng thái bệnh không hợp lệ.", 400);
  }
  if (
    input.treatment_protocol !== undefined &&
    (input.treatment_protocol === null ||
      typeof input.treatment_protocol !== "object" ||
      Array.isArray(input.treatment_protocol))
  ) {
    throw createError("Phác đồ điều trị phải là một đối tượng JSON.", 400);
  }

  const diseaseData = {};
  for (const field of DISEASE_FIELDS) {
    if (input[field] !== undefined) diseaseData[field] = input[field];
  }
  diseaseData.disease_name = input.disease_name.trim();
  diseaseData.typical_symptoms = input.typical_symptoms.trim();
  for (const field of optionalStringFields) {
    if (diseaseData[field] !== undefined) {
      diseaseData[field] = diseaseData[field].trim();
    }
  }

  return { diseaseData, plantIds };
};

const assertPlantsExist = async (plantIds, session) => {
  const plants = await Plant.find({ _id: { $in: plantIds } })
    .select("_id")
    .session(session)
    .lean();

  if (plants.length !== plantIds.length) {
    throw createError("Một hoặc nhiều cây được chọn không tồn tại.", 400);
  }
};

const assertDiseaseNameAvailable = async (name, excludedId, session) => {
  const filter = { disease_name: name };
  if (excludedId) filter._id = { $ne: excludedId };

  const duplicate = await Disease.findOne(filter)
    .collation({ locale: "vi", strength: 2 })
    .session(session)
    .select("_id")
    .lean();
  if (duplicate) throw createError("Tên bệnh đã tồn tại.", 409);
};

const synchronizeDiseasePlants = async (diseaseId, plantIds, session) => {
  await Plant.updateMany(
    { common_disease_ids: diseaseId },
    { $pull: { common_disease_ids: diseaseId } },
    { session },
  );
  await Plant.updateMany(
    { _id: { $in: plantIds } },
    { $addToSet: { common_disease_ids: diseaseId } },
    { session },
  );
};

const runDiseaseMutation = async (operation) => {
  try {
    return await mongoose.connection.transaction(operation);
  } catch (error) {
    if (error?.code === 11000) {
      throw createError("Tên bệnh đã tồn tại.", 409);
    }
    throw error;
  }
};

const createDisease = async (input) => {
  const { diseaseData, plantIds } = normalizeDiseaseInput(input);
  let diseaseId;

  await runDiseaseMutation(async (session) => {
    await assertDiseaseNameAvailable(diseaseData.disease_name, null, session);
    await assertPlantsExist(plantIds, session);

    const [disease] = await Disease.create([diseaseData], { session });
    diseaseId = disease._id;
    await synchronizeDiseasePlants(diseaseId, plantIds, session);
  });

  return getDiseaseById(diseaseId, true);
};

const updateDisease = async (id, input) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError("Định dạng ID bệnh không hợp lệ.", 400);
  }
  const { diseaseData, plantIds } = normalizeDiseaseInput(input);

  await runDiseaseMutation(async (session) => {
    const disease = await Disease.findById(id).session(session);
    if (!disease) throw createError("Không tìm thấy bệnh cây này.", 404);

    await assertDiseaseNameAvailable(diseaseData.disease_name, id, session);
    await assertPlantsExist(plantIds, session);

    Object.assign(disease, diseaseData);
    await disease.save({ session });
    await synchronizeDiseasePlants(disease._id, plantIds, session);
  });

  return getDiseaseById(id, true);
};

const deleteDisease = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError("Định dạng ID bệnh không hợp lệ.", 400);
  }

  let deletedDisease;
  await runDiseaseMutation(async (session) => {
    const disease = await Disease.findById(id)
      .select("disease_name")
      .session(session)
      .lean();
    if (!disease) throw createError("Không tìm thấy bệnh cây này.", 404);

    await Disease.deleteOne({ _id: disease._id }, { session });
    await Plant.updateMany(
      { common_disease_ids: disease._id },
      { $pull: { common_disease_ids: disease._id } },
      { session },
    );

    deletedDisease = {
      _id: disease._id,
      disease_name: disease.disease_name,
    };
  });

  return deletedDisease;
};

module.exports = {
  getPublicDiseases: (query) => getDiseases(query, false),
  getManagerDiseases: (query) => getDiseases(query, true),
  getPublicDiseaseById: (id) => getDiseaseById(id, false),
  getManagerDiseaseById: (id) => getDiseaseById(id, true),
  createDisease,
  updateDisease,
  deleteDisease,
};
