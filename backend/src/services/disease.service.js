// services/disease.service.js - Nghiệp vụ đọc danh mục bệnh cây
const mongoose = require("mongoose");
const Disease = require("../models/disease.model");
const Plant = require("../models/plant.model");

const DISEASE_STATUSES = ["active", "inactive"];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

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

module.exports = {
  getPublicDiseases: (query) => getDiseases(query, false),
  getManagerDiseases: (query) => getDiseases(query, true),
  getPublicDiseaseById: (id) => getDiseaseById(id, false),
  getManagerDiseaseById: (id) => getDiseaseById(id, true),
};
