const multer = require("multer");
const path = require("node:path");
const AppError = require("../utils/app-error");
const sharp = require("sharp");

const uploadDirectory = path.resolve(__dirname, "../../uploads/plants");
const parse = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
    fields: 10,
    fieldSize: 8192,
  },
}).single("photo");

function imageExtension(buffer) {
  if (
    buffer.length >= 24 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    buffer.toString("ascii", 12, 16) === "IHDR" &&
    buffer.readUInt32BE(16) &&
    buffer.readUInt32BE(20)
  )
    return "png";
  if (
    buffer.length >= 4 &&
    buffer[0] === 255 &&
    buffer[1] === 216 &&
    buffer[2] === 255 &&
    buffer[buffer.length - 2] === 255 &&
    buffer[buffer.length - 1] === 217
  )
    return "jpg";
  return null;
}

const upload = (req, res, next) =>
  parse(req, res, async (error) => {
    if (error)
      return next(
        new AppError(
          "INVALID_PHOTO",
          error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
          "Chỉ chọn một ảnh JPG hoặc PNG, tối đa 10 MB.",
        ),
      );
    if (req.file && !imageExtension(req.file.buffer))
      return next(
        new AppError(
          "INVALID_PHOTO",
          400,
          "Nội dung ảnh phải là JPG hoặc PNG hợp lệ.",
        ),
      );
    if (req.file) {
      try {
        // Decode and re-encode: reject malformed images and discard metadata/trailing content.
        const image = sharp(req.file.buffer, {
          failOn: "warning",
          limitInputPixels: 40000000,
        }).rotate();
        req.file.buffer = await (
          imageExtension(req.file.buffer) === "png" ? image.png() : image.jpeg()
        ).toBuffer();
      } catch {
        return next(
          new AppError(
            "INVALID_PHOTO",
            400,
            "Ảnh bị lỗi hoặc kích thước ảnh quá lớn.",
          ),
        );
      }
    }
    next();
  });

module.exports = { upload, uploadDirectory, imageExtension };
