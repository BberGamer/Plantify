// careEvent.service.js - Business logic CRUD và ownership cho lịch sử chăm sóc
const mongoose = require('mongoose');
const CareEvent = require('./careEvent.model');
const UserPlant = require('./userPlant.model');
const { CARE_EVENT_TYPES } = require('./careEvent.model');
function httpError(message, statusCode = 400) { const error = new Error(message); error.statusCode = statusCode; return error; }
function objectId(id, message) { if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(message); }
function date(value) { const valueDate = value === undefined ? new Date() : new Date(value); if (Number.isNaN(valueDate.getTime())) throw httpError('performedAt không hợp lệ'); return valueDate; }
function notes(value) { if (value === undefined || value === null) return ''; if (typeof value !== 'string') throw httpError('notes phải là chuỗi'); return value.trim(); }
async function ownedPlant(userId, userPlantId) { objectId(userId, 'User ID không hợp lệ'); objectId(userPlantId, 'UserPlant ID không hợp lệ'); return UserPlant.findOne({ _id: userPlantId, userId, status: 'active' }); }
function createData(data = {}) { if (!CARE_EVENT_TYPES.includes(data.type)) throw httpError('type không hợp lệ'); return { type: data.type, performedAt: date(data.performedAt), notes: notes(data.notes) }; }
function updateData(data = {}) { const result = {}; if (data.type !== undefined) { if (!CARE_EVENT_TYPES.includes(data.type)) throw httpError('type không hợp lệ'); result.type = data.type; } if (data.performedAt !== undefined) result.performedAt = date(data.performedAt); if (data.notes !== undefined) result.notes = notes(data.notes); if (!Object.keys(result).length) throw httpError('Không có dữ liệu cập nhật hợp lệ'); return result; }
async function createCareEvent(userId, userPlantId, data) { if (!await ownedPlant(userId, userPlantId)) return null; return CareEvent.create({ ...createData(data), userId, userPlantId }); }
async function getCareEvents(userId, userPlantId) { if (!await ownedPlant(userId, userPlantId)) return null; return CareEvent.find({ userId, userPlantId }).sort({ performedAt: -1 }).lean(); }
async function updateCareEvent(userId, userPlantId, eventId, data) { objectId(eventId, 'CareEvent ID không hợp lệ'); if (!await ownedPlant(userId, userPlantId)) return null; return CareEvent.findOneAndUpdate({ _id: eventId, userId, userPlantId }, updateData(data), { new: true, runValidators: true }).lean(); }
async function deleteCareEvent(userId, userPlantId, eventId) { objectId(eventId, 'CareEvent ID không hợp lệ'); if (!await ownedPlant(userId, userPlantId)) return null; return CareEvent.findOneAndDelete({ _id: eventId, userId, userPlantId }).lean(); }
module.exports = { createCareEvent, getCareEvents, updateCareEvent, deleteCareEvent };
