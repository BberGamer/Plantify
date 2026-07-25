// post.upload.js - Multer middleware cho upload anh bai viet vao memory de luu MongoDB
const multer = require('multer');

const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    const error = new Error('Chỉ hỗ trợ tải lên tệp ảnh');
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
    // Data URL luu truc tiep trong MongoDB tang ~33%, nen gioi han nho de tranh vuot 16MB/document.
    fileSize: 1 * 1024 * 1024,
    files: 9,
  },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 8 },
]);

module.exports = { uploadPostImages };
