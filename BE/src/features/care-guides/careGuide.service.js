// Business logic cho Care Guides.
const mongoose = require('mongoose');
const CareGuide = require('./careGuide.model');
const Plant = require('../plants/plant.model');

const CARE_GUIDE_FIELDS = ['plantId', 'pruning', 'propagation', 'watering', 'repotting'];

function pickCareGuideFields(data = {}) {
  return CARE_GUIDE_FIELDS.reduce((result, field) => {
    if (data[field] !== undefined) result[field] = data[field];
    return result;
  }, {});
}

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(message, 400);
  }
}

function parsePositiveInteger(value, fieldName, fallback, maxValue) {
  if (value === undefined) return fallback;

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createHttpError(`${fieldName} phải là số nguyên dương`, 400);
  }

  return Math.min(parsedValue, maxValue);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensurePlantExists(plantId) {
  ensureObjectId(plantId, 'Plant ID không hợp lệ');
  const plant = await Plant.findById(plantId).select('_id').lean();
  if (!plant) {
    throw createHttpError('Không tìm thấy cây', 404);
  }
}

async function getAllCareGuides(filters = {}) {
  const { plantId, search, sort, page = 1, limit = 10 } = filters;
  const query = {};

  if (plantId) {
    ensureObjectId(plantId, 'Plant ID không hợp lệ');
    query.plantId = plantId;
  }

  const keyword = String(search || '').trim();
  if (keyword) {
    query.$or = ['pruning', 'propagation', 'watering', 'repotting'].map((field) => ({
      [field]: { $regex: escapeRegex(keyword), $options: 'i' },
    }));
  }

  const safePage = parsePositiveInteger(page, 'page', 1, Number.MAX_SAFE_INTEGER);
  const safeLimit = parsePositiveInteger(limit, 'limit', 10, 100);
  const total = await CareGuide.countDocuments(query);
  const pages = Math.max(Math.ceil(total / safeLimit), 1);
  const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const careGuides = await CareGuide.find(query)
    .sort(sortOption)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return { careGuides, total, pages, currentPage: safePage };
}

async function getCareGuideById(id) {
  ensureObjectId(id, 'CareGuide ID không hợp lệ');
  return CareGuide.findById(id).lean();
}

async function createCareGuide(data = {}) {
  if (!data.plantId) {
    throw createHttpError('ID cây là bắt buộc', 400);
  }

  await ensurePlantExists(data.plantId);

  const careGuide = new CareGuide(pickCareGuideFields(data));
  return careGuide.save();
}

async function updateCareGuide(id, data = {}) {
  ensureObjectId(id, 'CareGuide ID không hợp lệ');

  const updateData = pickCareGuideFields(data);
  if (updateData.plantId !== undefined && !updateData.plantId) {
    throw createHttpError('ID cây không được để trống', 400);
  }
  if (updateData.plantId !== undefined) {
    await ensurePlantExists(updateData.plantId);
  }
  if (!Object.keys(updateData).length) {
    throw createHttpError('Không có dữ liệu cập nhật hợp lệ', 400);
  }

  return CareGuide.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();
}

async function deleteCareGuide(id) {
  ensureObjectId(id, 'CareGuide ID không hợp lệ');
  return CareGuide.findByIdAndDelete(id);
}

module.exports = {
  getAllCareGuides,
  getCareGuideById,
  createCareGuide,
  updateCareGuide,
  deleteCareGuide,
};
