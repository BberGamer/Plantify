// aiDiagnosis.upload.js - Multer middleware cho upload ảnh chẩn đoán bệnh cây
const multer = require('multer');

const storage = multer.memoryStorage();
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function imageFileFilter(req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    const error = new Error('Chỉ hỗ trợ upload file ảnh');
    error.statusCode = 400;
    cb(error);
    return;
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    const error = new Error('Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng JPG, PNG, hoặc WebP.');
    error.statusCode = 400;
    cb(error);
    return;
  }

  cb(null, true);
}

const uploadSingleDiagnosisImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
  },
}).single('file');

/** Chuyển lỗi Multer thành lỗi HTTP nhất quán. @param {Object} error - Lỗi upload. @returns {Error} Lỗi có statusCode. */
function normalizeUploadError(error) {
  if (error instanceof multer.MulterError) {
    error.statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      error.message = 'Ảnh chẩn đoán không được vượt quá 5MB';
    }
    return error;
  }

  if (error) error.statusCode = error.statusCode || 400;
  return error;
}

/**
 * Nhận duy nhất field multipart "file" vào memory và chuẩn hóa lỗi upload.
 */
/** Nhận một ảnh diagnosis vào memory và chuyển lỗi qua Express. @param {Object} req @param {Object} res @param {Function} next @returns {void} */
function uploadDiagnosisImage(req, res, next) {
  return uploadSingleDiagnosisImage(req, res, (error) => {
    if (error) return next(normalizeUploadError(error));
    return next();
  });
}

module.exports = {
  uploadDiagnosisImage,
  imageFileFilter,
  normalizeUploadError,
};
