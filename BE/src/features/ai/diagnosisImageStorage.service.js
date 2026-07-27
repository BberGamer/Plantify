const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

const UPLOADS_ROOT = path.resolve(__dirname, '../../../uploads');
const MIME_TYPES = {
  'image/jpeg': { extension: 'jpg', mimeType: 'image/jpeg' },
  'image/jpg': { extension: 'jpg', mimeType: 'image/jpeg' },
  'image/png': { extension: 'png', mimeType: 'image/png' },
  'image/webp': { extension: 'webp', mimeType: 'image/webp' },
};

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureUserId(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError('User ID không hợp lệ', 400);
  }
}

function resolveStoragePath(storageKey) {
  if (typeof storageKey !== 'string' || !storageKey.trim()) {
    throw createHttpError('Storage key không hợp lệ', 400);
  }

  const normalizedKey = storageKey.trim().replace(/\\/g, '/');
  if (
    path.posix.isAbsolute(normalizedKey)
    || /^[a-zA-Z]:\//.test(normalizedKey)
    || normalizedKey.split('/').includes('..')
    || !normalizedKey.startsWith('diagnoses/')
  ) {
    throw createHttpError('Storage key không hợp lệ', 400);
  }

  const filePath = path.resolve(UPLOADS_ROOT, ...normalizedKey.split('/'));
  const uploadsPrefix = `${UPLOADS_ROOT}${path.sep}`;
  if (!filePath.startsWith(uploadsPrefix)) {
    throw createHttpError('Storage key nằm ngoài thư mục uploads', 400);
  }

  return filePath;
}

/**
 * Lưu Multer memory file vào thư mục uploads và chỉ trả metadata có thể lưu MongoDB.
 * @param {string} userId - ID của customer đã authenticate
 * @param {object} file - Multer file có Buffer trong field buffer
 * @returns {Promise<{storageKey: string, url: string, mimeType: string, sizeBytes: number}>}
 */
/** Validate magic bytes rồi lưu ảnh diagnosis vào thư mục riêng của user. @param {string} userId - ID người dùng. @param {Object} file - File Multer trong memory. @returns {Promise<Object>} Storage key và metadata ảnh. */
async function saveDiagnosisImage(userId, file) {
  ensureUserId(userId);

  const imageType = MIME_TYPES[file?.mimetype?.toLowerCase()];
  if (!imageType) {
    throw createHttpError('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP', 400);
  }
  if (!Buffer.isBuffer(file?.buffer) || file.buffer.length === 0) {
    throw createHttpError('Buffer ảnh không hợp lệ', 400);
  }

  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const filename = `${crypto.randomUUID()}.${imageType.extension}`;
  const storageKey = path.posix.join(
    'diagnoses',
    String(userId),
    year,
    month,
    filename
  );
  const filePath = resolveStoragePath(storageKey);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, file.buffer, { flag: 'wx' });

  return {
    storageKey,
    url: `/uploads/${storageKey}`,
    mimeType: imageType.mimeType,
    sizeBytes: file.buffer.length,
  };
}

/**
 * Xóa ảnh đã lưu để rollback. Không báo lỗi nếu file đã bị xóa trước đó.
 * @param {string} storageKey - Đường dẫn tương đối bên trong BE/uploads
 * @returns {Promise<boolean>} true nếu đã xóa file, false nếu file không tồn tại
 */
/** Xóa ảnh diagnosis khỏi storage nếu tồn tại. @param {string} storageKey - Khóa đường dẫn tương đối. @returns {Promise<void>} */
async function deleteDiagnosisImage(storageKey) {
  const filePath = resolveStoragePath(storageKey);

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

module.exports = {
  saveDiagnosisImage,
  deleteDiagnosisImage,
};
