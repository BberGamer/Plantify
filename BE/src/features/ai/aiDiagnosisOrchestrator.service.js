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
const MIN_MATCH_SCORE = 0.75;
const MIN_SCORE_MARGIN = 0.15;
const SEVERITIES = new Set(['low', 'medium', 'high', 'unknown']);
const AFFECTED_PARTS = new Set([
  'leaf',
  'stem',
  'root',
  'flower',
  'whole_plant',
  'unknown',
]);
const UNKNOWN_CONDITIONS = new Set([
  'unknown',
  'khong-du-du-lieu',
  'khong-xac-dinh',
  'khong-ro',
]);
const HEALTHY_CONDITIONS = new Set([
  'healthy',
  'healthy-plant',
  'plant-healthy',
  'cay-khoe',
  'cay-khoe-manh',
  'khoe-manh',
]);
const MATCHABLE_CATEGORIES = new Set([
  'disease',
  'pest',
  'nutrient',
  'environment',
]);
const COMMON_MATCH_WORDS = new Set([
  'benh',
  'disease',
  'va',
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
  const suspectedCondition = typeof rawResponse.suspectedCondition === 'string'
    ? rawResponse.suspectedCondition.trim()
    : '';
  const category = String(rawResponse.category || '').trim().toLowerCase();
  const observedSymptoms = Array.isArray(rawResponse.observedSymptoms)
    ? rawResponse.observedSymptoms
      .filter((symptom) => typeof symptom === 'string')
      .map((symptom) => symptom.trim())
      .filter(Boolean)
    : [];

  return {
    suspectedCondition,
    confidence: normalizeConfidence(rawResponse.confidence),
    observedSymptoms,
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
    || UNKNOWN_CONDITIONS.has(normalizeDiseaseKey(diagnosis.suspectedCondition));
}

function isHealthyDiagnosis(diagnosis) {
  return diagnosis.category === 'healthy'
    || HEALTHY_CONDITIONS.has(normalizeDiseaseKey(diagnosis.suspectedCondition))
    || /\b(healthy|khoe manh|cay khoe)\b/.test(
      normalizeDiseaseKey(diagnosis.suspectedCondition).replace(/-/g, ' ')
    );
}

function normalizeMatchText(value) {
  return normalizeDiseaseKey(value)
    .split('-')
    .filter((token) => token && !COMMON_MATCH_WORDS.has(token))
    .join('-');
}

function populateDiseases(query) {
  return query
    .populate(
      'recommendedProducts',
      'name thumbnail images price stock isActive'
    )
    .lean();
}

function getCandidateTerms(disease) {
  return [disease.name, ...(Array.isArray(disease.aliases) ? disease.aliases : [])]
    .map(normalizeMatchText)
    .filter(Boolean);
}

function getTokenSimilarity(leftValue, rightValue) {
  const normalizedLeft = normalizeMatchText(leftValue);
  const normalizedRight = normalizeMatchText(rightValue);
  if (normalizedLeft && normalizedLeft === normalizedRight) return 1;

  const leftTokens = new Set(normalizedLeft.split('-').filter(Boolean));
  const rightTokens = new Set(normalizedRight.split('-').filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  const sharedCount = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  if (sharedCount < 2) return 0;

  const containment = sharedCount / Math.min(leftTokens.size, rightTokens.size);
  const dice = (2 * sharedCount) / (leftTokens.size + rightTokens.size);
  return (containment * 0.6) + (dice * 0.4);
}

function getSymptomSimilarity(observedSymptoms, knowledgeSymptoms) {
  if (!observedSymptoms.length || !knowledgeSymptoms.length) return 0;
  const scores = observedSymptoms.map((observed) => (
    Math.max(0, ...knowledgeSymptoms.map(
      (known) => getTokenSimilarity(observed, known)
    ))
  ));
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function scoreDiseaseCandidate(diagnosis, disease) {
  const conditionScore = Math.max(
    0,
    ...getCandidateTerms(disease).map(
      (term) => getTokenSimilarity(diagnosis.suspectedCondition, term)
    )
  );
  const symptomScore = getSymptomSimilarity(
    diagnosis.observedSymptoms,
    Array.isArray(disease.symptoms) ? disease.symptoms : []
  );
  return Number(((conditionScore * 0.8) + (symptomScore * 0.2)).toFixed(4));
}

function chooseDiseaseMatch(diagnosis, diseases) {
  const rankedCandidates = diseases
    .map((disease) => ({
      disease,
      score: scoreDiseaseCandidate(diagnosis, disease),
    }))
    .sort((left, right) => right.score - left.score);
  const topCandidate = rankedCandidates[0];
  const secondCandidate = rankedCandidates[1];

  if (!topCandidate || topCandidate.score < MIN_MATCH_SCORE) {
    return { disease: null, matchScore: topCandidate?.score || 0, matchStatus: 'unmatched' };
  }
  if (
    secondCandidate
    && topCandidate.score - secondCandidate.score < MIN_SCORE_MARGIN
  ) {
    return {
      disease: null,
      matchScore: topCandidate.score,
      matchStatus: 'needs_review',
    };
  }
  return {
    disease: topCandidate.disease,
    matchScore: topCandidate.score,
    matchStatus: 'matched',
  };
}

async function matchPlantDisease(diagnosis) {
  if (diagnosis.confidence < MIN_MATCH_CONFIDENCE) {
    return { disease: null, matchScore: 0, matchStatus: 'low_confidence' };
  }
  if (isUnknownDiagnosis(diagnosis) || isHealthyDiagnosis(diagnosis)) {
    return { disease: null, matchScore: 0, matchStatus: 'unknown' };
  }
  if (!MATCHABLE_CATEGORIES.has(diagnosis.category)) {
    return { disease: null, matchScore: 0, matchStatus: 'unmatched' };
  }

  const candidates = await populateDiseases(PlantDisease.find({
    isActive: true,
    category: diagnosis.category,
  }));
  return chooseDiseaseMatch(
    diagnosis,
    candidates.filter((disease) => disease.category === diagnosis.category),
  );
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
    const matchResult = await matchPlantDisease(normalizedAI);
    const { disease, matchScore, matchStatus } = matchResult;
    const diagnosis = {
      diseaseId: disease?._id || null,
      diseaseKey: disease?.diseaseKey || 'unknown',
      category: disease?.category || normalizedAI.category || 'unknown',
      rawDiseaseName: normalizedAI.suspectedCondition,
      observedSymptoms: normalizedAI.observedSymptoms,
      matchScore,
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
  normalizeMatchText,
  getTokenSimilarity,
  scoreDiseaseCandidate,
  chooseDiseaseMatch,
};
