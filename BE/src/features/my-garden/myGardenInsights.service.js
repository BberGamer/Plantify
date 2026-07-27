const mongoose = require('mongoose');
const UserPlant = require('./userPlant.model');
const CareEvent = require('./careEvent.model');
const DiagnosisHistory = require('../diagnosis-history/diagnosisHistory.model');

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(message);
  }
}

function positiveInteger(value, fieldName, fallback, maximum) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw httpError(`${fieldName} phải là số nguyên dương`);
  }
  return Math.min(parsed, maximum);
}

function getVietnamDayBounds(value = new Date()) {
  const shifted = new Date(value.getTime() + VIETNAM_OFFSET_MS);
  const start = new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate()
    ) - VIETNAM_OFFSET_MS
  );
  return {
    start,
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
  };
}

function normalizeCareEvent(event) {
  return {
    _id: `care-event:${event._id}`,
    sourceId: event._id,
    type: event.type,
    occurredAt: event.performedAt,
    notes: event.notes || '',
    careEvent: {
      type: event.type,
    },
  };
}

function normalizeDiagnosis(history) {
  const disease = history.diagnosis?.diseaseId;
  return {
    _id: `diagnosis:${history._id}`,
    sourceId: history._id,
    type: 'diagnosis',
    occurredAt: history.createdAt,
    notes: history.diagnosis?.description || '',
    imageUrl: history.image?.url || '',
    diagnosis: {
      historyId: history._id,
      diseaseName: disease?.name
        || history.diagnosis?.rawDiseaseName
        || history.diagnosis?.diseaseKey
        || 'Chưa xác định',
      diseaseKey: history.diagnosis?.diseaseKey || '',
      matchStatus: history.diagnosis?.matchStatus || 'unknown',
      confidence: history.diagnosis?.confidence ?? 0,
      severity: history.diagnosis?.severity || 'unknown',
    },
  };
}

function normalizeAlbumImage(image) {
  return {
    _id: `image:${image._id}`,
    sourceId: image._id,
    type: 'image',
    occurredAt: image.capturedAt || image.createdAt,
    notes: image.caption || '',
    imageUrl: image.url,
    image: {
      url: image.url,
      caption: image.caption || '',
      capturedAt: image.capturedAt || null,
    },
  };
}

async function getMyUserPlantTimeline(
  userId,
  userPlantId,
  filters = {}
) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(userPlantId, 'UserPlant ID không hợp lệ');
  const page = positiveInteger(filters.page, 'page', 1, Number.MAX_SAFE_INTEGER);
  const limit = positiveInteger(filters.limit, 'limit', 10, 50);

  const userPlant = await UserPlant.findOne({
    _id: userPlantId,
    userId,
    status: 'active',
  }).lean();
  if (!userPlant) return null;

  const [careEvents, diagnoses] = await Promise.all([
    CareEvent.find({ userId, userPlantId })
      .sort({ performedAt: -1 })
      .lean(),
    DiagnosisHistory.find({ userId, userPlantId })
      .populate('diagnosis.diseaseId', 'name diseaseKey category')
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const events = [
    ...careEvents.map(normalizeCareEvent),
    ...diagnoses.map(normalizeDiagnosis),
    ...(userPlant.albumImages || []).map(normalizeAlbumImage),
  ].sort(
    (left, right) => new Date(right.occurredAt) - new Date(left.occurredAt)
  );
  const total = events.length;

  return {
    events: events.slice((page - 1) * limit, page * limit),
    total,
    pages: Math.max(Math.ceil(total / limit), 1),
    currentPage: page,
  };
}

function toDashboardPlant(userPlant, scheduleType, nextDueAt) {
  return {
    _id: userPlant._id,
    name: userPlant.name,
    coverImageUrl: userPlant.coverImageUrl || '',
    catalogPlantId: userPlant.catalogPlantId || null,
    scheduleType,
    nextDueAt,
  };
}

async function getMyGardenDashboard(userId, now = new Date()) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  const userPlants = await UserPlant.find({ userId, status: 'active' })
    .populate('catalogPlantId', 'name thumbnail images')
    .lean();
  const { end: endOfToday } = getVietnamDayBounds(now);
  const wateringDueToday = [];
  const fertilizingDueToday = [];
  const overdueByPlantId = new Map();

  for (const userPlant of userPlants) {
    for (const [scheduleField, scheduleType, dueTodayTarget] of [
      ['wateringSchedule', 'watering', wateringDueToday],
      ['fertilizingSchedule', 'fertilizing', fertilizingDueToday],
    ]) {
      const schedule = userPlant[scheduleField];
      const nextDueAt = schedule?.nextDueAt
        ? new Date(schedule.nextDueAt)
        : null;
      if (
        !schedule?.enabled
        || !nextDueAt
        || Number.isNaN(nextDueAt.getTime())
      ) {
        continue;
      }

      if (nextDueAt < now) {
        const existing = overdueByPlantId.get(String(userPlant._id)) || {
          ...toDashboardPlant(userPlant),
          dueSchedules: [],
        };
        existing.dueSchedules.push({ type: scheduleType, nextDueAt });
        overdueByPlantId.set(String(userPlant._id), existing);
      } else if (nextDueAt < endOfToday) {
        dueTodayTarget.push(
          toDashboardPlant(userPlant, scheduleType, nextDueAt)
        );
      }
    }
  }

  const activePlantIds = userPlants.map((userPlant) => userPlant._id);
  let latestDiagnosis = null;
  if (activePlantIds.length) {
    const history = await DiagnosisHistory.findOne({
      userId,
      userPlantId: { $in: activePlantIds },
    })
      .populate('userPlantId', 'name coverImageUrl catalogPlantId')
      .populate('diagnosis.diseaseId', 'name diseaseKey category')
      .sort({ createdAt: -1 })
      .lean();
    if (history) {
      latestDiagnosis = {
        _id: history._id,
        userPlantId: history.userPlantId,
        createdAt: history.createdAt,
        imageUrl: history.image?.url || '',
        diseaseName: history.diagnosis?.diseaseId?.name
          || history.diagnosis?.rawDiseaseName
          || history.diagnosis?.diseaseKey
          || 'Chưa xác định',
        matchStatus: history.diagnosis?.matchStatus || 'unknown',
        confidence: history.diagnosis?.confidence ?? 0,
      };
    }
  }

  return {
    totalPlants: userPlants.length,
    wateringDueToday,
    fertilizingDueToday,
    overduePlants: [...overdueByPlantId.values()],
    latestDiagnosis,
  };
}

module.exports = {
  getVietnamDayBounds,
  getMyUserPlantTimeline,
  getMyGardenDashboard,
};
