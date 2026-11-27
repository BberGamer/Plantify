const multer = require("multer");
const AppError = require("../utils/app-error");
const { sanitizePhoto } = require("./garden-upload.middleware");
const v = require("../validators/common");
const { MAX_PHOTOS_PER_SAVE, normalizeImageUrls } = require("../validators/catalog-images");

const parse = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: MAX_PHOTOS_PER_SAVE,
    fields: 1,
    parts: MAX_PHOTOS_PER_SAVE + 2,
    fieldSize: 100 * 1024,
  },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "photos", maxCount: MAX_PHOTOS_PER_SAVE },
]);

function uploadCatalog(req, res, next) {
  if (!req.is("multipart/form-data")) return next();
  return parse(req, res, async (error) => {
    if (error)
      return next(new AppError(
        "INVALID_PHOTO",
        error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
        "Mỗi lần lưu tối đa 6 ảnh JPG hoặc PNG, không quá 10 MB mỗi ảnh.",
      ));
    try {
      let data;
      try {
        data = JSON.parse(req.body.payload);
      } catch {
        v.invalid("payload", "Thông tin không hợp lệ.");
      }
      v.object(data);
      const images = normalizeImageUrls(data.image_urls, req.files.photos?.length);
      if (images !== undefined) {
        if (req.files.photo) v.invalid("image_urls", "Ảnh bìa phải nằm trong thư viện ảnh.");
        data.image_urls = images;
      }
      for (const file of Object.values(req.files).flat()) await sanitizePhoto(file);
      req.body = data;
      return next();
    } catch (failure) {
      return next(failure);
    }
  });
}

module.exports = uploadCatalog;
