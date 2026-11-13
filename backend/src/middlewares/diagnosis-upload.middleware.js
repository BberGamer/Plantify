const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/app-error");

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const parse = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0, parts: 1 },
}).single("photo");

const invalidPhoto = (status = 400) => new AppError(
  "DIAGNOSIS_INVALID_PHOTO", status,
  "Chọn một ảnh JPEG, PNG hoặc WebP tĩnh, tối đa 10 MiB và 25 megapixel.",
);

const uploadDiagnosisPhoto = (req, res, next) => parse(req, res, async (error) => {
  if (error) return next(invalidPhoto(error.code === "LIMIT_FILE_SIZE" ? 413 : 400));
  if (!req.file || !req.file.buffer.length) return next(invalidPhoto());
  try {
    const info = await sharp(req.file.buffer, {
      limitInputPixels: 25000000, failOn: "warning", animated: true,
    }).metadata();
    const mime = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }[info.format];
    if (!mime || !info.width || !info.height || (info.pages || 1) > 1)
      return next(invalidPhoto(415));
    if (info.width * info.height > 25000000) return next(invalidPhoto(413));
    // Chỉ xác minh format/kích thước; giữ nguyên bytes/EXIF cho pipeline Python.
    req.file.mimetype = mime;
    next();
  } catch {
    next(invalidPhoto());
  }
});

module.exports = { uploadDiagnosisPhoto, MAX_IMAGE_BYTES };
