// userPlant.service.js - Business logic CRUD và ownership cho My Garden
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const Plant = require('../plants/plant.model');
const UserPlant = require('./userPlant.model');
const CareEvent = require('./careEvent.model');
const DiagnosisHistory = require('../diagnosis-history/diagnosisHistory.model');
const {
  Notification,
  PLANT_CARE_NOTIFICATION_TYPES,
} = require('../notifications/notification.model');
const { runRequiredTransaction } = require('./transaction.utils');

const CATALOG_PLANT_FIELDS = 'name scientificName thumbnail images';
const MY_GARDEN_UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads/my-garden');
const MIME_EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

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

function normalizeOptionalDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw createHttpError('capturedAt không hợp lệ', 400);
  return date;
}

function addUtcMonths(value, months) {
  const result = new Date(value);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    0
  )).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

function normalizeCareSchedule(value, fieldName, now = new Date()) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createHttpError(`${fieldName} không hợp lệ`, 400);
  }
  if (typeof value.enabled !== 'boolean') {
    throw createHttpError(`${fieldName}.enabled phải là boolean`, 400);
  }

  const frequencyDays = value.frequencyDays === null
    || value.frequencyDays === undefined
    ? null
    : Number(value.frequencyDays);
  if (
    frequencyDays !== null
    && (!Number.isInteger(frequencyDays)
      || frequencyDays < 1
      || frequencyDays > 365)
  ) {
    throw createHttpError(
      `${fieldName}.frequencyDays phải là số nguyên từ 1 đến 365`,
      400
    );
  }

  let nextDueAt = null;
  if (value.nextDueAt !== null && value.nextDueAt !== undefined && value.nextDueAt !== '') {
    nextDueAt = new Date(value.nextDueAt);
    if (Number.isNaN(nextDueAt.getTime())) {
      throw createHttpError(`${fieldName}.nextDueAt không hợp lệ`, 400);
    }
    const lowerBoundary = new Date(now);
    lowerBoundary.setMilliseconds(0);
    if (nextDueAt < lowerBoundary) {
      throw createHttpError(
        `${fieldName}.nextDueAt không được ở quá khứ`,
        400
      );
    }
    if (nextDueAt > addUtcMonths(lowerBoundary, 12)) {
      throw createHttpError(
        `${fieldName}.nextDueAt không được quá 12 tháng`,
        400
      );
    }
  }

  if (value.enabled && (!frequencyDays || !nextDueAt)) {
    throw createHttpError(
      `${fieldName} cần frequencyDays và nextDueAt khi được bật`,
      400
    );
  }

  return {
    enabled: value.enabled,
    frequencyDays,
    configuredNextDueAt: nextDueAt,
    nextDueAt,
  };
}

function defaultCareSchedule() {
  return {
    enabled: false,
    frequencyDays: null,
    lastCompletedAt: null,
    configuredNextDueAt: null,
    nextDueAt: null,
  };
}

function getImageTypeFromMagicBytes(buffer) {
  if (buffer?.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer?.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer?.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

function getSafeStoragePath(storageKey) {
  const resolvedPath = path.resolve(MY_GARDEN_UPLOAD_ROOT, storageKey.replace(/^my-garden[\\/]/, ''));
  if (!resolvedPath.startsWith(`${MY_GARDEN_UPLOAD_ROOT}${path.sep}`)) {
    throw createHttpError('Đường dẫn file không hợp lệ', 400);
  }
  return resolvedPath;
}

async function findOwnedActiveUserPlant(userId, userPlantId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(userPlantId, 'UserPlant ID không hợp lệ');
  return UserPlant.findOne({ _id: userPlantId, userId, status: 'active' });
}

/** Populate catalogue rồi chuyển document sang object trước khi trả response album. */
async function toPopulatedUserPlant(userPlant) {
  if (!userPlant) return userPlant;
  if (typeof userPlant.populate === 'function') {
    await userPlant.populate('catalogPlantId', CATALOG_PLANT_FIELDS);
  }
  return typeof userPlant.toObject === 'function' ? userPlant.toObject() : userPlant;
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
  const wateringSchedule = data.wateringSchedule === undefined
    ? defaultCareSchedule()
    : {
      ...normalizeCareSchedule(data.wateringSchedule, 'wateringSchedule'),
      lastCompletedAt: null,
    };
  const fertilizingSchedule = data.fertilizingSchedule === undefined
    ? defaultCareSchedule()
    : {
      ...normalizeCareSchedule(data.fertilizingSchedule, 'fertilizingSchedule'),
      lastCompletedAt: null,
    };

  return {
    catalogPlantId: data.catalogPlantId === undefined
      ? null
      : data.catalogPlantId,
    name: normalizeRequiredName(data.name, 'Tên cây là bắt buộc'),
    coverImageUrl: '',
    notes: data.notes === undefined
      ? ''
      : normalizeOptionalString(data.notes, 'notes'),
    wateringSchedule,
    fertilizingSchedule,
    status: 'active',
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
  if (data.notes !== undefined) {
    updateData.notes = normalizeOptionalString(data.notes, 'notes');
  }
  ['wateringSchedule', 'fertilizingSchedule'].forEach((fieldName) => {
    if (data[fieldName] === undefined) return;
    const schedule = normalizeCareSchedule(data[fieldName], fieldName);
    updateData[`${fieldName}.enabled`] = schedule.enabled;
    updateData[`${fieldName}.frequencyDays`] = schedule.frequencyDays;
    updateData[`${fieldName}.configuredNextDueAt`] = schedule.configuredNextDueAt;
    updateData[`${fieldName}.nextDueAt`] = schedule.nextDueAt;
  });
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
 * Xóa vĩnh viễn cây, dữ liệu chăm sóc và thư mục ảnh thuộc đúng user.
 */
async function deleteUserPlantRecords(userId, userPlantId, session = null) {
  const sessionOptions = session ? { session } : {};
  const userPlant = await UserPlant.findOneAndDelete(
    { _id: userPlantId, userId },
    sessionOptions
  ).lean();
  if (!userPlant) return null;

  await CareEvent.deleteMany({ userId, userPlantId }, sessionOptions);
  await DiagnosisHistory.updateMany(
    { userId, userPlantId },
    { $set: { userPlantId: null } },
    sessionOptions
  );
  await Notification.deleteMany(
    {
      userPlantId,
      type: { $in: PLANT_CARE_NOTIFICATION_TYPES },
    },
    sessionOptions
  );
  return userPlant;
}

async function removeUserPlantUploadDirectory(userId, userPlantId) {
  const storageKey = path.posix.join(
    'my-garden',
    String(userId),
    String(userPlantId)
  );
  await fs.rm(getSafeStoragePath(storageKey), {
    recursive: true,
    force: true,
  });
}

async function deleteMyUserPlant(userId, userPlantId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(userPlantId, 'UserPlant ID không hợp lệ');

  const userPlant = await runRequiredTransaction(
    (session) => deleteUserPlantRecords(userId, userPlantId, session),
    'MongoDB deployment không hỗ trợ transaction bắt buộc để xóa cây an toàn'
  );

  if (userPlant) {
    try {
      await removeUserPlantUploadDirectory(userId, userPlantId);
    } catch (error) {
      console.error(
        `[my-garden] Không thể xóa thư mục album ${userId}/${userPlantId}:`,
        error
      );
    }
  }
  return userPlant;
}

/** Lưu buffer ảnh, sau đó thêm metadata vào album; xóa file nếu MongoDB lưu lỗi. */
async function uploadUserPlantImage(userId, userPlantId, file, data = {}) {
  const detectedImageType = getImageTypeFromMagicBytes(file?.buffer);
  if (!file?.buffer || !MIME_EXTENSIONS[file.mimetype] || detectedImageType !== file.mimetype) {
    throw createHttpError('Chưa nhận được ảnh hợp lệ', 400);
  }
  const caption = data.caption === undefined ? '' : normalizeOptionalString(data.caption, 'caption').trim();
  const capturedAt = normalizeOptionalDate(data.capturedAt);
  const userPlant = await findOwnedActiveUserPlant(userId, userPlantId);
  if (!userPlant) return null;

  const filename = `${crypto.randomUUID()}.${MIME_EXTENSIONS[file.mimetype]}`;
  const storageKey = path.posix.join('my-garden', String(userId), String(userPlantId), filename);
  const filePath = getSafeStoragePath(storageKey);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, file.buffer, { flag: 'wx' });

  const image = {
    _id: new mongoose.Types.ObjectId(),
    url: `/uploads/${storageKey}`,
    storageKey,
    caption,
    capturedAt,
    createdAt: new Date(),
  };
  try {
    userPlant.albumImages.push(image);
    if (!userPlant.coverImageUrl) userPlant.coverImageUrl = image.url;
    await userPlant.save();
    return toPopulatedUserPlant(userPlant);
  } catch (error) {
    await fs.unlink(filePath).catch(() => {});
    throw error;
  }
}

/** Sửa caption hoặc đặt ảnh album làm cover sau khi xác thực owner. */
async function updateUserPlantImage(userId, userPlantId, imageId, data = {}) {
  ensureObjectId(imageId, 'Image ID không hợp lệ');
  const userPlant = await findOwnedActiveUserPlant(userId, userPlantId);
  if (!userPlant) return null;
  const image = userPlant.albumImages.id(imageId);
  if (!image) return false;
  let changed = false;
  if (data.caption !== undefined) { image.caption = normalizeOptionalString(data.caption, 'caption').trim(); changed = true; }
  if (data.setAsCover !== undefined) {
    if (typeof data.setAsCover !== 'boolean') throw createHttpError('setAsCover phải là boolean', 400);
    if (data.setAsCover) userPlant.coverImageUrl = image.url;
    changed = true;
  }
  if (!changed) throw createHttpError('Không có dữ liệu ảnh hợp lệ để cập nhật', 400);
  await userPlant.save();
  return toPopulatedUserPlant(userPlant);
}

/** Xóa metadata và file ảnh; khi xóa cover thì chuyển sang ảnh album kế tiếp. */
async function deleteUserPlantImage(userId, userPlantId, imageId) {
  ensureObjectId(imageId, 'Image ID không hợp lệ');
  const userPlant = await findOwnedActiveUserPlant(userId, userPlantId);
  if (!userPlant) return null;
  const image = userPlant.albumImages.id(imageId);
  if (!image) return false;
  const { url, storageKey } = image;
  image.deleteOne();
  if (userPlant.coverImageUrl === url) userPlant.coverImageUrl = userPlant.albumImages[0]?.url || '';
  await userPlant.save();
  await fs.unlink(getSafeStoragePath(storageKey)).catch(() => {});
  return toPopulatedUserPlant(userPlant);
}

module.exports = {
  createUserPlant,
  getMyUserPlants,
  getMyUserPlantById,
  updateMyUserPlant,
  deleteMyUserPlant,
  uploadUserPlantImage,
  updateUserPlantImage,
  deleteUserPlantImage,
  getSafeStoragePath,
  MY_GARDEN_UPLOAD_ROOT,
  getImageTypeFromMagicBytes,
  toPopulatedUserPlant,
};
