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

const uploadDiagnosisImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
  },
}).single('file');

module.exports = { uploadDiagnosisImage };
