const mongoose = require('mongoose');
const DiagnosisHistory = require('./diagnosisHistory.model');

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

async function createDiagnosisHistory(userId, data = {}) {
  ensureObjectId(userId, 'User ID không hợp lệ');

  const history = new DiagnosisHistory({
    ...normalizeCreateData(data),
    userId,
  });
  return history.save();
}

async function getMyDiagnosisHistories(userId, filters = {}) {
  ensureObjectId(userId, 'User ID không hợp lệ');

  const query = { userId };
  if (filters.userPlantId) {
    ensureObjectId(filters.userPlantId, 'UserPlant ID không hợp lệ');
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

async function getMyDiagnosisHistoryById(userId, historyId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(historyId, 'DiagnosisHistory ID không hợp lệ');

  return DiagnosisHistory.findOne({ _id: historyId, userId })
    .populate(DETAIL_POPULATE_OPTIONS)
    .lean();
}

module.exports = {
  createDiagnosisHistory,
  getMyDiagnosisHistories,
  getMyDiagnosisHistoryById,
};
