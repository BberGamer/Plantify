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

/** Ánh xạ loại chăm sóc sang trường lịch tương ứng. @param {string} type - Loại sự kiện. @returns {string|null} Tên trường lịch hoặc `null`. */
function scheduleFieldForType(type) {
  if (type === 'watering') return 'wateringSchedule';
  if (type === 'fertilizing') return 'fertilizingSchedule';
  return null;
}

/** Đồng bộ mốc hoàn thành và lần đến hạn tiếp theo từ sự kiện mới nhất. @param {Object} options - Dữ liệu đồng bộ. @returns {Promise<void>} */
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
    if (!schedule.configuredNextDueAt && schedule.nextDueAt) {
      scheduleUpdate[`${scheduleField}.configuredNextDueAt`] = schedule.nextDueAt;
    }
    scheduleUpdate[`${scheduleField}.nextDueAt`] = new Date(
      new Date(latestEvent.performedAt).getTime()
      + schedule.frequencyDays * 24 * 60 * 60 * 1000
    );
  } else {
    scheduleUpdate[`${scheduleField}.nextDueAt`] =
      schedule.configuredNextDueAt || schedule.nextDueAt || null;
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

/** Validate và chuẩn hóa payload sự kiện chăm sóc. @param {Object} [data={}] - Payload đầu vào. @returns {Object} Dữ liệu hợp lệ. @throws {Error} Khi type hoặc thời điểm không hợp lệ. */
function createData(data = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw httpError('Payload ghi nhận tưới không hợp lệ');
  }
  const fields = Object.keys(data);
  if (
    fields.length !== 1
    || fields[0] !== 'type'
    || !['watering', 'fertilizing'].includes(data.type)
  ) {
    throw httpError(
      'Chỉ chấp nhận hoàn thành lịch tưới hoặc bón phân'
    );
  }
  return {
    type: data.type,
    performedAt: new Date(),
    notes: '',
  };
}

/** Tạo sự kiện chăm sóc và cập nhật lịch cây trong transaction. @param {string} userId - ID người dùng. @param {string} userPlantId - ID cây. @param {Object} data - Dữ liệu sự kiện. @returns {Promise<Object>} Sự kiện vừa tạo. @throws {Error} Khi cây không thuộc người dùng hoặc transaction thất bại. */
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
    const scheduleField = scheduleFieldForType(eventData.type);
    if (!userPlant[scheduleField]?.enabled) {
      throw httpError('Lịch chăm sóc tương ứng chưa được bật', 409);
    }

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
        type: eventData.type === 'watering'
          ? 'plant_watering_due'
          : 'plant_fertilizing_due',
      },
      { session }
    );

    return careEvent;
  }, 'MongoDB deployment không hỗ trợ transaction bắt buộc để ghi nhận chăm sóc');
}

/** Lấy lịch sử chăm sóc của cây thuộc người dùng. @param {string} userId - ID người dùng. @param {string} userPlantId - ID cây. @returns {Promise<Object[]>} Danh sách sự kiện. */
async function getCareEvents(userId, userPlantId) {
  if (!await ownedPlant(userId, userPlantId)) return null;
  return CareEvent.find({ userId, userPlantId })
    .sort({ performedAt: -1 })
    .lean();
}

/** Xóa sự kiện và đồng bộ lại lịch từ sự kiện gần nhất trong transaction. @param {string} userId - ID người dùng. @param {string} userPlantId - ID cây. @param {string} eventId - ID sự kiện. @returns {Promise<Object>} Kết quả xóa. */
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
      {
        _id: eventId,
        userId,
        userPlantId,
        type: { $in: ['watering', 'fertilizing'] },
      },
      { session }
    ).lean();
    if (!deletedEvent) return null;

    await syncScheduleFromLatestCareEvent({
      userId,
      userPlantId,
      type: deletedEvent.type,
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
