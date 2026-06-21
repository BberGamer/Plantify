// post.upload.js - Multer middleware cho upload ảnh bài viết
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../../../uploads/posts');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || '').toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, uniqueName);
  },
});

function imageFileFilter(req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    const error = new Error('Chỉ hỗ trợ upload file ảnh');
    error.statusCode = 400;
    cb(error);
    return;
  }

  cb(null, true);
}

const uploadPostImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 9,
  },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 8 },
]);

module.exports = { uploadPostImages };
