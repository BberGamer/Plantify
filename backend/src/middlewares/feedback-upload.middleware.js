const multer = require("multer");
const sharp = require("sharp");
const { MAX_IMAGE_BYTES } = require("./diagnosis-upload.middleware");
const AppError = require("../utils/app-error");

const parse = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES + 1, files: 5, fields: 2, fieldSize: 2048, parts: 8 },
}).array("images", 5);

function invalid(message, status = 400) {
  return new AppError("FEEDBACK_INVALID_IMAGES", status, message, { images: message });
}

module.exports = (req, res, next) => {
  parse(req, res, async (error) => {
    if (error?.code === "LIMIT_FILE_SIZE" || req.files?.some(file => file.size > MAX_IMAGE_BYTES))
      return next(invalid("Mỗi ảnh được tối đa 10 MB.", 413));
    if (error || !req.files?.length)
      return next(invalid("Vui lòng gửi từ 1 đến 5 ảnh JPG, PNG hoặc WebP."));
    try {
      for (const file of req.files) {
        const info = await sharp(file.buffer, { limitInputPixels: 25000000, failOn: "warning", animated: true }).metadata();
        if (!["jpeg", "png", "webp"].includes(info.format) || !info.width || !info.height || (info.pages || 1) > 1)
          throw invalid("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP tĩnh.", 415);
        // Giải mã để phát hiện ảnh hỏng trước khi ghi bất kỳ ảnh nào.
        await sharp(file.buffer, { limitInputPixels: 25000000, failOn: "warning" }).resize(1, 1).raw().toBuffer();
      }
      next();
    } catch (failure) {
      next(failure instanceof AppError ? failure : invalid("Có ảnh bị hỏng hoặc vượt quá 25 megapixel."));
    }
  });
};
