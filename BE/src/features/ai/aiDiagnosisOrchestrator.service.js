const path = require('path');
const PlantDisease = require('../plant-diseases/plantDisease.model');
const aiService = require('./ai.service');
const {
  saveDiagnosisImage,
  deleteDiagnosisImage,
} = require('./diagnosisImageStorage.service');
const {
  createDiagnosisHistory,
} = require('../diagnosis-history/diagnosisHistory.service');

const MIN_MATCH_CONFIDENCE = 0.5;
const SEVERITIES = new Set(['low', 'medium', 'high', 'unknown']);
const AFFECTED_PARTS = new Set([
  'leaf',
  'stem',
  'root',
  'flower',
  'whole_plant',
  'unknown',
]);
const UNKNOWN_KEYS = new Set([
  'unknown',
  'khong-du-du-lieu',
  'khong-xac-dinh',
  'khong-ro',
]);
const HEALTHY_KEYS = new Set([
  'healthy',
  'healthy-plant',
  'plant-healthy',
  'cay-khoe',
  'cay-khoe-manh',
  'khoe-manh',
]);

function normalizeDiseaseKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeConfidence(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  const normalizedValue = numberValue > 1 ? numberValue / 100 : numberValue;
  return Math.max(0, Math.min(normalizedValue, 1));
}

function normalizeEnum(value, allowedValues, fallback = 'unknown') {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return allowedValues.has(normalizedValue) ? normalizedValue : fallback;
}

function normalizeAIResponse(rawResponse = {}) {
  const rawDiseaseName = typeof rawResponse.label === 'string'
    ? rawResponse.label.trim()
    : '';
  const diseaseKey = normalizeDiseaseKey(
    rawResponse.diseaseKey || rawDiseaseName || 'unknown'
  ) || 'unknown';
  const category = String(rawResponse.category || '').trim().toLowerCase();

  return {
    diseaseKey,
    rawDiseaseName,
    confidence: normalizeConfidence(rawResponse.confidence),
    severity: normalizeEnum(rawResponse.severity, SEVERITIES),
    affectedPart: normalizeEnum(rawResponse.affectedPart, AFFECTED_PARTS),
    description: typeof rawResponse.description === 'string'
      ? rawResponse.description.trim()
      : '',
    category,
    model: typeof rawResponse.model === 'string'
      ? rawResponse.model.trim()
      : '',
    provider: typeof rawResponse.provider === 'string'
      ? rawResponse.provider.trim()
      : 'openrouter',
  };
}

function isUnknownDiagnosis(diagnosis) {
  return diagnosis.category === 'unknown'
    || UNKNOWN_KEYS.has(diagnosis.diseaseKey);
}

function isHealthyDiagnosis(diagnosis) {
  return diagnosis.category === 'healthy'
    || HEALTHY_KEYS.has(diagnosis.diseaseKey)
    || /\b(healthy|khoe manh|cay khoe)\b/.test(
      normalizeDiseaseKey(diagnosis.rawDiseaseName).replace(/-/g, ' ')
    );
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function populateDisease(query) {
  return query
    .populate(
      'recommendedProducts',
      'name thumbnail price stock isActive'
    )
    .lean();
}

async function matchPlantDisease(diagnosis) {
  if (
    diagnosis.confidence < MIN_MATCH_CONFIDENCE
    || isUnknownDiagnosis(diagnosis)
    || isHealthyDiagnosis(diagnosis)
  ) {
    return null;
  }

  const exactMatch = await populateDisease(PlantDisease.findOne({
    diseaseKey: diagnosis.diseaseKey,
    isActive: true,
  }));
  if (exactMatch) return exactMatch;

  const names = [diagnosis.rawDiseaseName, diagnosis.diseaseKey]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  if (names.length === 0) return null;

  return populateDisease(PlantDisease.findOne({
    isActive: true,
    $or: names.flatMap((name) => {
      const exactName = new RegExp(`^${escapeRegex(name)}$`, 'i');
      return [{ name: exactName }, { aliases: exactName }];
    }),
  }));
}

function getMatchStatus(diagnosis, disease) {
  if (diagnosis.confidence < MIN_MATCH_CONFIDENCE) return 'low_confidence';
  if (isUnknownDiagnosis(diagnosis) || isHealthyDiagnosis(diagnosis)) {
    return 'unknown';
  }
  return disease ? 'matched' : 'unmatched';
}

function buildDiseaseInfo(disease) {
  if (!disease) return null;
  return {
    _id: disease._id,
    name: disease.name,
    diseaseKey: disease.diseaseKey,
    category: disease.category,
    symptoms: Array.isArray(disease.symptoms) ? disease.symptoms : [],
    causes: Array.isArray(disease.causes) ? disease.causes : [],
    images: Array.isArray(disease.images) ? disease.images : [],
  };
}

async function orchestrateDiagnosis({
  userId,
  file,
  userPlantId,
  catalogPlantId,
}) {
  let image = null;

  try {
    image = await saveDiagnosisImage(userId, file);
    const rawAIResponse = await aiService.diagnoseFromImage(
      file.buffer,
      path.posix.basename(image.storageKey),
      image.mimeType
    );
    const normalizedAI = normalizeAIResponse(rawAIResponse);
    const disease = await matchPlantDisease(normalizedAI);
    const matchStatus = getMatchStatus(normalizedAI, disease);
    const diagnosis = {
      diseaseId: disease?._id || null,
      diseaseKey: disease?.diseaseKey || normalizedAI.diseaseKey,
      rawDiseaseName: normalizedAI.rawDiseaseName,
      confidence: normalizedAI.confidence,
      severity: normalizedAI.severity,
      affectedPart: normalizedAI.affectedPart,
      description: normalizedAI.description,
      matchStatus,
    };
    const recommendations = {
      treatments: disease?.treatments || [],
      preventions: disease?.preventions || [],
    };
    const recommendedProducts = (disease?.recommendedProducts || []).filter(
      (product) => product?.isActive === true && Number(product.stock) > 0
    );

    const history = await createDiagnosisHistory(userId, {
      userPlantId,
      catalogPlantId,
      image,
      diagnosis,
      ai: {
        provider: normalizedAI.provider,
        model: normalizedAI.model || 'unknown',
        rawResponse: normalizedAI,
      },
      recommendationSnapshot: {
        ...recommendations,
        productIds: recommendedProducts.map((product) => product._id),
      },
      status: 'completed',
    });

    return {
      diagnosis,
      diseaseInfo: buildDiseaseInfo(disease),
      recommendations,
      recommendedProducts,
      diagnosisHistoryId: history._id,
      createdAt: history.createdAt,
    };
  } catch (error) {
    if (image?.storageKey) {
      try {
        await deleteDiagnosisImage(image.storageKey);
      } catch {
        // Rollback là best effort; giữ nguyên lỗi gốc để error handler xử lý đúng.
      }
    }
    throw error;
  }
}

module.exports = {
  orchestrateDiagnosis,
  diagnoseAndSave: orchestrateDiagnosis,
  normalizeDiseaseKey,
  normalizeConfidence,
  normalizeAIResponse,
  matchPlantDisease,
};
