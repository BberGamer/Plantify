// userPlant.upload.js - Middleware Multer nhận một ảnh album My Garden trong bộ nhớ
const multer = require('multer');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function imageFileFilter(req, file, callback) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    const error = new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP');
    error.statusCode = 400;
    callback(error);
    return;
  }
  callback(null, true);
}

const uploadSingleUserPlantImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
}).single('file');

function uploadUserPlantImage(req, res, next) {
  uploadSingleUserPlantImage(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      error.statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      if (error.code === 'LIMIT_FILE_SIZE') error.message = 'Ảnh không được vượt quá 5MB';
    }
    if (error) return next(error);
    return next();
  });
}

module.exports = { uploadUserPlantImage, imageFileFilter, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE };
