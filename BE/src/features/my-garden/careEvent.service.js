// careEvent.service.js - Business logic CRUD và ownership cho lịch sử chăm sóc
const mongoose = require('mongoose');
const CareEvent = require('./careEvent.model');
const UserPlant = require('./userPlant.model');
const { Notification } = require('../notifications/notification.model');
const { runRequiredTransaction } = require('./transaction.utils');

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function objectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(message);
}

async function ownedPlant(userId, userPlantId) {
  objectId(userId, 'User ID không hợp lệ');
  objectId(userPlantId, 'UserPlant ID không hợp lệ');
  return UserPlant.findOne({ _id: userPlantId, userId, status: 'active' });
}

function scheduleFieldForType(type) {
  if (type === 'watering') return 'wateringSchedule';
  if (type === 'fertilizing') return 'fertilizingSchedule';
  return null;
}

async function syncScheduleFromLatestCareEvent({
  userId,
  userPlantId,
  type,
  session,
}) {
  const scheduleField = scheduleFieldForType(type);
  if (!scheduleField) return;

  const userPlant = await UserPlant.findOne(
    { _id: userPlantId, userId, status: 'active' },
    null,
    { session }
  );
  const schedule = userPlant?.[scheduleField];
  if (!schedule?.enabled) return;

  const latestEvent = await CareEvent.findOne(
    { userId, userPlantId, type },
    null,
    { session }
  )
    .sort({ performedAt: -1 })
    .lean();

  const scheduleUpdate = {
    [`${scheduleField}.lastCompletedAt`]: latestEvent?.performedAt || null,
  };

  if (latestEvent) {
    if (
      !Number.isInteger(schedule.frequencyDays)
      || schedule.frequencyDays < 1
      || schedule.frequencyDays > 365
    ) {
      throw httpError('Cấu hình chu kỳ chăm sóc không hợp lệ', 409);
    }
    scheduleUpdate[`${scheduleField}.nextDueAt`] = new Date(
      new Date(latestEvent.performedAt).getTime()
      + schedule.frequencyDays * 24 * 60 * 60 * 1000
    );
  }

  await UserPlant.updateOne(
    {
      _id: userPlantId,
      userId,
      status: 'active',
      [`${scheduleField}.enabled`]: true,
    },
    { $set: scheduleUpdate },
    { session, runValidators: true }
  );
}

function createData(data = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw httpError('Payload ghi nhận tưới không hợp lệ');
  }
  const fields = Object.keys(data);
  if (
    fields.length !== 1
    || fields[0] !== 'type'
    || data.type !== 'watering'
  ) {
    throw httpError('Chỉ chấp nhận thao tác tưới với type watering');
  }
  return {
    type: 'watering',
    performedAt: new Date(),
    notes: '',
  };
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

    await syncScheduleFromLatestCareEvent({
      userId,
      userPlantId,
      type: eventData.type,
      session,
    });
    await Notification.deleteMany(
      {
        recipientId: userId,
        userPlantId,
        type: 'plant_watering_due',
      },
      { session }
    );

    return careEvent;
  }, 'MongoDB deployment không hỗ trợ transaction bắt buộc để ghi nhận chăm sóc');
}

async function getCareEvents(userId, userPlantId) {
  if (!await ownedPlant(userId, userPlantId)) return null;
  return CareEvent.find({ userId, userPlantId })
    .sort({ performedAt: -1 })
    .lean();
}

async function deleteCareEvent(userId, userPlantId, eventId) {
  objectId(userId, 'User ID không hợp lệ');
  objectId(userPlantId, 'UserPlant ID không hợp lệ');
  objectId(eventId, 'CareEvent ID không hợp lệ');

  return runRequiredTransaction(async (session) => {
    const userPlant = await UserPlant.findOne(
      { _id: userPlantId, userId, status: 'active' },
      null,
      { session }
    );
    if (!userPlant) return null;

    const deletedEvent = await CareEvent.findOneAndDelete(
      { _id: eventId, userId, userPlantId, type: 'watering' },
      { session }
    ).lean();
    if (!deletedEvent) return null;

    await syncScheduleFromLatestCareEvent({
      userId,
      userPlantId,
      type: 'watering',
      session,
    });

    return deletedEvent;
  }, 'MongoDB deployment không hỗ trợ transaction bắt buộc để xóa lịch sử chăm sóc');
}

module.exports = {
  syncScheduleFromLatestCareEvent,
  createCareEvent,
  getCareEvents,
  deleteCareEvent,
};
