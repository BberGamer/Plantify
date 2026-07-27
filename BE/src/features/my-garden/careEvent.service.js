// careEvent.service.js - Business logic CRUD và ownership cho lịch sử chăm sóc
const mongoose = require('mongoose');
const CareEvent = require('./careEvent.model');
const UserPlant = require('./userPlant.model');
const { CARE_EVENT_TYPES } = require('./careEvent.model');

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function objectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(message);
}

function performedAt(value, plantCreatedAt, now = new Date()) {
  if (value === null || value === '') {
    throw httpError('Thời gian thực hiện không hợp lệ');
  }

  const valueDate = value === undefined ? now : new Date(value);
  if (Number.isNaN(valueDate.getTime())) {
    throw httpError('Thời gian thực hiện không hợp lệ');
  }

  const createdAt = new Date(plantCreatedAt);
  if (!Number.isNaN(createdAt.getTime()) && valueDate < createdAt) {
    throw httpError('Thời gian thực hiện không được trước ngày tạo cây');
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

function createData(data = {}, plantCreatedAt) {
  if (!CARE_EVENT_TYPES.includes(data.type)) {
    throw httpError('type không hợp lệ');
  }
  return {
    type: data.type,
    performedAt: performedAt(data.performedAt, plantCreatedAt),
    notes: notes(data.notes),
  };
}

function updateData(data = {}, plantCreatedAt) {
  const result = {};
  if (data.type !== undefined) {
    if (!CARE_EVENT_TYPES.includes(data.type)) {
      throw httpError('type không hợp lệ');
    }
    result.type = data.type;
  }
  if (data.performedAt !== undefined) {
    result.performedAt = performedAt(data.performedAt, plantCreatedAt);
  }
  if (data.notes !== undefined) result.notes = notes(data.notes);
  if (!Object.keys(result).length) {
    throw httpError('Không có dữ liệu cập nhật hợp lệ');
  }
  return result;
}

async function createCareEvent(userId, userPlantId, data) {
  const userPlant = await ownedPlant(userId, userPlantId);
  if (!userPlant) return null;
  return CareEvent.create({
    ...createData(data, userPlant.createdAt),
    userId,
    userPlantId,
  });
}

async function getCareEvents(userId, userPlantId) {
  if (!await ownedPlant(userId, userPlantId)) return null;
  return CareEvent.find({ userId, userPlantId })
    .sort({ performedAt: -1 })
    .lean();
}

async function updateCareEvent(userId, userPlantId, eventId, data) {
  objectId(eventId, 'CareEvent ID không hợp lệ');
  const userPlant = await ownedPlant(userId, userPlantId);
  if (!userPlant) return null;
  return CareEvent.findOneAndUpdate(
    { _id: eventId, userId, userPlantId },
    updateData(data, userPlant.createdAt),
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
