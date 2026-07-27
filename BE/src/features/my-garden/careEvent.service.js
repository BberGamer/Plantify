// careEvent.service.js - Business logic CRUD và ownership cho lịch sử chăm sóc
const mongoose = require('mongoose');
const CareEvent = require('./careEvent.model');
const UserPlant = require('./userPlant.model');
const { CARE_EVENT_TYPES } = require('./careEvent.model');
const { runRequiredTransaction } = require('./transaction.utils');

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function objectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(message);
}

function performedAt(value, now = new Date()) {
  if (value === null || value === '') {
    throw httpError('Thời gian thực hiện không hợp lệ');
  }
  const valueDate = value === undefined ? now : new Date(value);
  if (Number.isNaN(valueDate.getTime())) {
    throw httpError('Thời gian thực hiện không hợp lệ');
  }
  if (valueDate > now) {
    throw httpError('Thời gian thực hiện không được ở tương lai');
  }
  return valueDate;
}

function notes(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw httpError('notes phải là chuỗi');
  return value.trim();
}

async function ownedPlant(userId, userPlantId) {
  objectId(userId, 'User ID không hợp lệ');
  objectId(userPlantId, 'UserPlant ID không hợp lệ');
  return UserPlant.findOne({ _id: userPlantId, userId, status: 'active' });
}

function createData(data = {}) {
  if (!CARE_EVENT_TYPES.includes(data.type)) {
    throw httpError('type không hợp lệ');
  }
  return {
    type: data.type,
    performedAt: performedAt(data.performedAt),
    notes: notes(data.notes),
  };
}

function updateData(data = {}) {
  const result = {};
  if (data.type !== undefined) {
    if (!CARE_EVENT_TYPES.includes(data.type)) {
      throw httpError('type không hợp lệ');
    }
    result.type = data.type;
  }
  if (data.performedAt !== undefined) {
    result.performedAt = performedAt(data.performedAt);
  }
  if (data.notes !== undefined) result.notes = notes(data.notes);
  if (!Object.keys(result).length) {
    throw httpError('Không có dữ liệu cập nhật hợp lệ');
  }
  return result;
}

async function createCareEvent(userId, userPlantId, data) {
  objectId(userId, 'User ID không hợp lệ');
  objectId(userPlantId, 'UserPlant ID không hợp lệ');
  const eventData = createData(data);

  return runRequiredTransaction(async (session) => {
    const userPlant = await UserPlant.findOne(
      { _id: userPlantId, userId, status: 'active' },
      null,
      { session }
    );
    if (!userPlant) return null;

    const [careEvent] = await CareEvent.create([{
      ...eventData,
      userId,
      userPlantId,
    }], { session });

    const scheduleField = eventData.type === 'watering'
      ? 'wateringSchedule'
      : eventData.type === 'fertilizing'
        ? 'fertilizingSchedule'
        : null;
    const schedule = scheduleField ? userPlant[scheduleField] : null;

    if (schedule?.enabled) {
      if (
        !Number.isInteger(schedule.frequencyDays)
        || schedule.frequencyDays < 1
        || schedule.frequencyDays > 365
      ) {
        throw httpError('Cấu hình chu kỳ chăm sóc không hợp lệ', 409);
      }
      const nextDueAt = new Date(
        eventData.performedAt.getTime()
        + schedule.frequencyDays * 24 * 60 * 60 * 1000
      );
      await UserPlant.updateOne(
        {
          _id: userPlantId,
          userId,
          status: 'active',
          [`${scheduleField}.enabled`]: true,
        },
        {
          $set: {
            [`${scheduleField}.lastCompletedAt`]: eventData.performedAt,
            [`${scheduleField}.nextDueAt`]: nextDueAt,
          },
        },
        { session, runValidators: true }
      );
    }

    return careEvent;
  }, 'MongoDB deployment không hỗ trợ transaction bắt buộc để ghi nhận chăm sóc');
}

async function getCareEvents(userId, userPlantId) {
  if (!await ownedPlant(userId, userPlantId)) return null;
  return CareEvent.find({ userId, userPlantId })
    .sort({ performedAt: -1 })
    .lean();
}

async function updateCareEvent(userId, userPlantId, eventId, data) {
  objectId(eventId, 'CareEvent ID không hợp lệ');
  if (!await ownedPlant(userId, userPlantId)) return null;
  return CareEvent.findOneAndUpdate(
    { _id: eventId, userId, userPlantId },
    updateData(data),
    { new: true, runValidators: true }
  ).lean();
}

async function deleteCareEvent(userId, userPlantId, eventId) {
  objectId(eventId, 'CareEvent ID không hợp lệ');
  if (!await ownedPlant(userId, userPlantId)) return null;
  return CareEvent.findOneAndDelete({
    _id: eventId,
    userId,
    userPlantId,
  }).lean();
}

module.exports = {
  createCareEvent,
  getCareEvents,
  updateCareEvent,
  deleteCareEvent,
};
