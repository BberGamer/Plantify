const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const sharp = require("sharp");
const AppError = require("../utils/app-error");
const cloudinary = require("./cloudinary-photo.service");

const directory = path.resolve(__dirname, "../../uploads/diagnoses");
const photoPath = filename => {
  if (typeof filename !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.jpg$/.test(filename))
    throw new AppError("DIAGNOSIS_IMAGE_NOT_FOUND", 404, "Ảnh chẩn đoán không còn khả dụng.");
  return path.join(directory, filename);
};

const localSave = async content => {
  // Chỉ tạo bản lưu sau khi chẩn đoán được chấp nhận; không đổi bytes đưa vào model.
  await fs.mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.jpg`;
  try {
    await fs.writeFile(photoPath(filename), content, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") await fs.unlink(photoPath(filename)).catch(() => {});
    throw error;
  }
  return { storage: "local", filename };
};

const localRemove = async filename => {
  try { await fs.unlink(photoPath(filename)); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
};

const createPhotoStorage = ({ env = process.env, cloud = cloudinary.createCloudinaryPhotos({ env }) } = {}) => ({
  async save(photo) {
    const provider = env.DIAGNOSIS_PHOTO_STORAGE ?? "local";
    if (!["local", "cloudinary"].includes(provider))
      throw new AppError("DIAGNOSIS_PHOTO_NOT_CONFIGURED", 503, "Nơi lưu ảnh chẩn đoán chưa được cấu hình hợp lệ.");
    const content = await sharp(photo.buffer, { limitInputPixels: 25000000, failOn: "warning" })
      .rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 }).toBuffer();
    return provider === "cloudinary" ? cloud.save(content) : localSave(content);
  },
  async remove(image) {
    if (typeof image === "string") return localRemove(image);
    if (image.storage === "cloudinary") return cloud.remove(image);
    if (image.storage && image.storage !== "local") throw new AppError("DIAGNOSIS_IMAGE_NOT_FOUND", 404, "Ảnh không còn khả dụng.");
    return localRemove(image.filename);
  },
  async read(image) {
    if (image?.storage === "cloudinary") return cloud.read(image);
    if (image?.storage && image.storage !== "local") throw new AppError("DIAGNOSIS_IMAGE_NOT_FOUND", 404, "Ảnh không còn khả dụng.");
    return photoPath(image?.filename);
  },
  photoPath,
});

module.exports = { ...createPhotoStorage(), createPhotoStorage };
