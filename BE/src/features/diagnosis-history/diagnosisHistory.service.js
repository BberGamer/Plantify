// diagnosisHistory.service.js
// Xử lý lưu trữ, truy vấn và phân trang lịch sử chẩn đoán của người dùng.

const mongoose = require('mongoose');
const DiagnosisHistory = require('./diagnosisHistory.model');
const UserPlant = require('../my-garden/userPlant.model');
const {
  deleteDiagnosisImage,
} = require('../ai/diagnosisImageStorage.service');

const LIST_POPULATE_OPTIONS = [
  {
    path: 'diagnosis.diseaseId',
    select: 'name diseaseKey category',
  },
  {
    path: 'catalogPlantId',
    select: 'name scientificName',
  },
];

const DETAIL_POPULATE_OPTIONS = [
  {
    path: 'diagnosis.diseaseId',
    select: 'name diseaseKey category symptoms causes treatments preventions images',
  },
  {
    path: 'catalogPlantId',
    select: 'name scientificName',
  },
  {
    path: 'recommendationSnapshot.productIds',
    select: 'name thumbnail images price stock isActive',
  },
];

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

function optionalObjectId(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  ensureObjectId(value, `${fieldName} không hợp lệ`);
  return value;
}

/** Validate và chuẩn hóa snapshot chẩn đoán trước khi lưu. @param {Object} [data={}] - Dữ liệu chẩn đoán. @returns {Object} Payload model hợp lệ. @throws {Error} Khi dữ liệu bắt buộc không hợp lệ. */
function normalizeCreateData(data = {}) {
  const diagnosis = data.diagnosis || {};
  const recommendationSnapshot = data.recommendationSnapshot || {};
  const productIds = Array.isArray(recommendationSnapshot.productIds)
    ? recommendationSnapshot.productIds
    : [];

  productIds.forEach((productId) => {
    ensureObjectId(productId, 'Product ID không hợp lệ');
  });

  return {
    userPlantId: optionalObjectId(data.userPlantId, 'UserPlant ID'),
    catalogPlantId: optionalObjectId(data.catalogPlantId, 'Plant ID'),
    image: {
      storageKey: data.image?.storageKey,
      url: data.image?.url,
      mimeType: data.image?.mimeType,
      sizeBytes: data.image?.sizeBytes,
    },
    diagnosis: {
      diseaseId: optionalObjectId(diagnosis.diseaseId, 'PlantDisease ID'),
      diseaseKey: String(diagnosis.diseaseKey || '').trim().toLowerCase(),
      category: String(diagnosis.category || 'unknown').trim().toLowerCase(),
      rawDiseaseName: diagnosis.rawDiseaseName,
      observedSymptoms: Array.isArray(diagnosis.observedSymptoms)
        ? diagnosis.observedSymptoms
        : [],
      matchScore: diagnosis.matchScore,
      confidence: diagnosis.confidence,
      severity: diagnosis.severity,
      affectedPart: diagnosis.affectedPart,
      description: diagnosis.description,
      matchStatus: diagnosis.matchStatus,
    },
    ai: {
      provider: data.ai?.provider,
      model: data.ai?.model,
      rawResponse: data.ai?.rawResponse,
    },
    recommendationSnapshot: {
      treatments: recommendationSnapshot.treatments,
      preventions: recommendationSnapshot.preventions,
      productIds,
    },
    status: data.status,
    failureReason: data.failureReason,
  };
}

/** Tạo lịch sử chẩn đoán và lưu snapshot kết quả AI. @param {string} userId - ID người chẩn đoán. @param {Object} [data={}] - Dữ liệu chẩn đoán. @returns {Promise<Object>} DiagnosisHistory vừa tạo. */
async function createDiagnosisHistory(userId, data = {}) {
  ensureObjectId(userId, 'User ID không hợp lệ');

  const history = new DiagnosisHistory({
    ...normalizeCreateData(data),
    userId,
  });
  return history.save();
}

/** Lấy lịch sử chẩn đoán của người dùng theo cây và phân trang. @param {string} userId - ID người dùng. @param {Object} [filters={}] - Bộ lọc query. @returns {Promise<Object>} Danh sách và metadata phân trang. */
async function getMyDiagnosisHistories(userId, filters = {}) {
  ensureObjectId(userId, 'User ID không hợp lệ');

  const query = { userId };
  if (filters.userPlantId) {
    ensureObjectId(filters.userPlantId, 'UserPlant ID không hợp lệ');
    const ownedPlant = await UserPlant.exists({
      _id: filters.userPlantId,
      userId,
      status: 'active',
    });
    if (!ownedPlant) {
      throw createHttpError('Không tìm thấy cây trong My Garden', 404);
    }
    query.userPlantId = filters.userPlantId;
  }

  const diseaseKey = String(filters.diseaseKey || '').trim().toLowerCase();
  if (diseaseKey) query['diagnosis.diseaseKey'] = diseaseKey;

  const page = parsePositiveInteger(filters.page, 'page', 1, Number.MAX_SAFE_INTEGER);
  const limit = parsePositiveInteger(filters.limit, 'limit', 10, 100);
  const total = await DiagnosisHistory.countDocuments(query);
  const histories = await DiagnosisHistory.find(query)
    .populate(LIST_POPULATE_OPTIONS)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    histories,
    total,
    pages: Math.max(Math.ceil(total / limit), 1),
    currentPage: page,
  };
}

/** Lấy một lịch sử chẩn đoán thuộc người dùng. @param {string} userId - ID người dùng. @param {string} historyId - ID lịch sử. @returns {Promise<Object>} Chi tiết lịch sử. */
async function getMyDiagnosisHistoryById(userId, historyId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(historyId, 'DiagnosisHistory ID không hợp lệ');

  return DiagnosisHistory.findOne({ _id: historyId, userId })
    .populate(DETAIL_POPULATE_OPTIONS)
    .lean();
}

/** Xóa ảnh trước khi hard-delete một lịch sử chẩn đoán thuộc người dùng. @param {string} userId - ID người dùng. @param {string} historyId - ID lịch sử. @returns {Promise<Object|null>} Lịch sử đã xóa hoặc `null`. */
async function deleteMyDiagnosisHistory(userId, historyId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(historyId, 'DiagnosisHistory ID không hợp lệ');

  const ownerQuery = {
    _id: historyId,
    userId,
  };
  const history = await DiagnosisHistory.findOne(ownerQuery)
    .select('image.storageKey')
    .lean();
  if (!history) return null;

  await deleteDiagnosisImage(history.image?.storageKey);

  return DiagnosisHistory.findOneAndDelete(ownerQuery).lean();
}

module.exports = {
  createDiagnosisHistory,
  getMyDiagnosisHistories,
  getMyDiagnosisHistoryById,
  deleteMyDiagnosisHistory,
};
