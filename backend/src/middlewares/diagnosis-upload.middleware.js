const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/app-error");

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const parse = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0, parts: 1 },
}).single("photo");

// Mục đích: Tạo lỗi ảnh đầu vào.
// Cách chạy: Đóng gói HTTP status và hướng dẫn định dạng, dung lượng ảnh.
const invalidPhoto = (
  status = 400,
  reason = "invalid_image",
  message = "Ảnh hỏng hoặc không đọc được. Vui lòng chọn ảnh khác.",
) => new AppError("DIAGNOSIS_INVALID_PHOTO", status, message, { reason });

// Mục đích: Nhận và xác minh ảnh upload.
// Cách chạy: Multer giữ một file trong RAM; Sharp kiểm tra định dạng, số trang và kích thước.
const uploadDiagnosisPhoto = (req, res, next) =>
  parse(req, res, async (error) => {
    if (error)
      return next(
        error.code === "LIMIT_FILE_SIZE"
          ? invalidPhoto(
              413,
              "image_too_large",
              "Ảnh vượt quá giới hạn 10 MiB.",
            )
          : invalidPhoto(
              400,
              "invalid_upload",
              "Chỉ gửi một file ảnh trong trường photo.",
            ),
      );
    if (!req.file || !req.file.buffer.length)
      return next(
        invalidPhoto(400, "empty_image", "Chưa có ảnh hợp lệ để phân tích."),
      );
    try {
      const info = await sharp(req.file.buffer, {
        limitInputPixels: 25000000,
        failOn: "warning",
        animated: true,
      }).metadata();
      const mime = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }[
        info.format
      ];
      if (!mime || !info.width || !info.height || (info.pages || 1) > 1)
        return next(
          invalidPhoto(
            415,
            "unsupported_format",
            "Chỉ nhận ảnh JPEG, PNG hoặc WebP tĩnh.",
          ),
        );
      if (info.width * info.height > 25000000)
        return next(
          invalidPhoto(
            413,
            "image_dimensions_too_large",
            "Ảnh vượt quá giới hạn 25 megapixel.",
          ),
        );
      // Giải mã để phát hiện ảnh hỏng, vẫn giữ bytes/EXIF gốc cho Python.
      await sharp(req.file.buffer, {
        limitInputPixels: 25000000,
        failOn: "warning",
      })
        .resize(1, 1)
        .raw()
        .toBuffer();
      req.file.mimetype = mime;
      next();
    } catch {
      next(invalidPhoto());
    }
  });

module.exports = { uploadDiagnosisPhoto, MAX_IMAGE_BYTES };
