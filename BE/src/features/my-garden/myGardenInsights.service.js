const mongoose = require('mongoose');
const UserPlant = require('./userPlant.model');
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

/** Tính đầu và cuối ngày theo múi giờ Việt Nam. @param {Date} [value=new Date()] - Thời điểm tham chiếu. @returns {Object} Hai mốc UTC start/end. */
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

/** Map cây và lịch đến hạn sang item dashboard. @param {Object} userPlant - Cây người dùng. @param {string} scheduleType - Loại lịch. @param {Date} nextDueAt - Thời điểm đến hạn. @returns {Object} Item dashboard. */
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

/** Tổng hợp thống kê, lịch đến hạn và cây gần đây cho My Garden. @param {string} userId - ID người dùng. @param {Date} [now=new Date()] - Thời điểm tham chiếu. @returns {Promise<Object>} Dữ liệu dashboard. */
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
  getMyGardenDashboard,
};
