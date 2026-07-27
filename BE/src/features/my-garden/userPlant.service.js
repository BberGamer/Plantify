// userPlant.service.js - Business logic CRUD và ownership cho My Garden
const mongoose = require('mongoose');
const Plant = require('../plants/plant.model');
const UserPlant = require('./userPlant.model');

const USER_PLANT_STATUSES = new Set(['active', 'archived']);
const CATALOG_PLANT_FIELDS = 'name scientificName thumbnail images';

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

function normalizeRequiredName(value, message) {
  if (typeof value !== 'string' || !value.trim()) {
    throw createHttpError(message, 400);
  }
  return value.trim();
}

function normalizeOptionalString(value, fieldName) {
  if (value === null) return '';
  if (typeof value !== 'string') {
    throw createHttpError(`${fieldName} phải là chuỗi`, 400);
  }
  return value;
}

function normalizeStatus(value) {
  if (typeof value !== 'string' || !USER_PLANT_STATUSES.has(value)) {
    throw createHttpError('Trạng thái cây không hợp lệ', 400);
  }
  return value;
}

/**
 * Kiểm tra cây danh mục tồn tại khi user muốn liên kết.
 */
async function ensureCatalogPlantExists(catalogPlantId) {
  if (catalogPlantId === null) return;

  ensureObjectId(catalogPlantId, 'Catalog Plant ID không hợp lệ');
  const plant = await Plant.findById(catalogPlantId).select('_id').lean();
  if (!plant) {
    throw createHttpError('Không tìm thấy cây trong danh mục', 404);
  }
}

function normalizeCreateData(data = {}) {
  return {
    catalogPlantId: data.catalogPlantId === undefined
      ? null
      : data.catalogPlantId,
    name: normalizeRequiredName(data.name, 'Tên cây là bắt buộc'),
    coverImageUrl: data.coverImageUrl === undefined
      ? ''
      : normalizeOptionalString(data.coverImageUrl, 'coverImageUrl'),
    notes: data.notes === undefined
      ? ''
      : normalizeOptionalString(data.notes, 'notes'),
    status: data.status === undefined
      ? 'active'
      : normalizeStatus(data.status),
  };
}

function normalizeUpdateData(data = {}) {
  const updateData = {};

  if (data.catalogPlantId !== undefined) {
    updateData.catalogPlantId = data.catalogPlantId;
  }
  if (data.name !== undefined) {
    updateData.name = normalizeRequiredName(
      data.name,
      'Tên cây không được để trống'
    );
  }
  if (data.coverImageUrl !== undefined) {
    updateData.coverImageUrl = normalizeOptionalString(
      data.coverImageUrl,
      'coverImageUrl'
    );
  }
  if (data.notes !== undefined) {
    updateData.notes = normalizeOptionalString(data.notes, 'notes');
  }
  if (data.status !== undefined) {
    updateData.status = normalizeStatus(data.status);
  }

  if (Object.keys(updateData).length === 0) {
    throw createHttpError('Không có dữ liệu cập nhật hợp lệ', 400);
  }
  return updateData;
}

/**
 * Tạo cây cho user từ token; mọi userId trong body đều bị bỏ qua.
 */
async function createUserPlant(userId, data = {}) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  const createData = normalizeCreateData(data);
  await ensureCatalogPlantExists(createData.catalogPlantId);

  const userPlant = new UserPlant({
    ...createData,
    userId,
  });
  return userPlant.save();
}

/**
 * Lấy các cây chưa bị archive của user hiện tại, mới nhất trước.
 */
async function getMyUserPlants(userId) {
  ensureObjectId(userId, 'User ID không hợp lệ');

  return UserPlant.find({ userId, status: 'active' })
    .populate('catalogPlantId', CATALOG_PLANT_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Lấy chi tiết cây active theo cả ID cây và owner.
 */
async function getMyUserPlantById(userId, userPlantId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(userPlantId, 'UserPlant ID không hợp lệ');

  return UserPlant.findOne({
    _id: userPlantId,
    userId,
    status: 'active',
  })
    .populate('catalogPlantId', CATALOG_PLANT_FIELDS)
    .lean();
}

/**
 * Cập nhật cây active nếu thuộc user hiện tại.
 */
async function updateMyUserPlant(userId, userPlantId, data = {}) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(userPlantId, 'UserPlant ID không hợp lệ');

  const updateData = normalizeUpdateData(data);
  if (updateData.catalogPlantId !== undefined) {
    await ensureCatalogPlantExists(updateData.catalogPlantId);
  }

  return UserPlant.findOneAndUpdate(
    { _id: userPlantId, userId, status: 'active' },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('catalogPlantId', CATALOG_PLANT_FIELDS)
    .lean();
}

/**
 * Soft delete cây bằng cách chuyển status sang archived.
 */
async function archiveMyUserPlant(userId, userPlantId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(userPlantId, 'UserPlant ID không hợp lệ');

  return UserPlant.findOneAndUpdate(
    { _id: userPlantId, userId, status: 'active' },
    { $set: { status: 'archived' } },
    { new: true, runValidators: true }
  ).lean();
}

module.exports = {
  createUserPlant,
  getMyUserPlants,
  getMyUserPlantById,
  updateMyUserPlant,
  archiveMyUserPlant,
};
