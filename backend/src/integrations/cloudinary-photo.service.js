const { createHash, randomUUID } = require("node:crypto");
const AppError = require("../utils/app-error");

const unavailable = () => new AppError("DIAGNOSIS_PHOTO_STORAGE_UNAVAILABLE", 503, "Chưa kết nối được nơi lưu ảnh chẩn đoán. Vui lòng thử lại.");
const notConfigured = () => new AppError("DIAGNOSIS_PHOTO_NOT_CONFIGURED", 503, "Nơi lưu ảnh chẩn đoán chưa được cấu hình đầy đủ.");
const configured = (env, configurationError = notConfigured) => {
  const text = key => typeof env[key] === "string" ? env[key].trim() : "";
  const cloud = text("CLOUDINARY_CLOUD_NAME"), key = text("CLOUDINARY_API_KEY"), secret = text("CLOUDINARY_API_SECRET");
  if (!cloud || !/^[\w-]+$/.test(cloud) || !key || !secret)
    throw configurationError();
  return { cloud, key, secret };
};
const sign = (params, secret) => createHash("sha256")
  .update(Object.keys(params).sort().map(key => `${key}=${params[key]}`).join("&") + secret).digest("hex");
const validPublicId = id => typeof id === "string" && /^plantify\/diagnoses\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
const bodyBytes = async (response, limit) => {
  if (Number(response.headers.get("content-length")) > limit) {
    await response.body?.cancel().catch(() => {});
    throw unavailable();
  }
  const reader = response.body?.getReader();
  if (!reader) throw unavailable();
  const chunks = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw unavailable(); }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  } finally { reader.releaseLock(); }
};

const createImagePost = (fetchImpl, getConfig, storageError) =>
  async (action, params, file, timeout = 20000) => {
    const config = getConfig();
    const signed = { ...params, timestamp: Math.floor(Date.now() / 1000) };
    const form = new FormData();
    for (const [key, value] of Object.entries(signed)) form.append(key, String(value));
    form.append("api_key", config.key); form.append("signature", sign(signed, config.secret));
    if (file) {
      const mimeType = file.extension === "png" ? "image/png" : "image/jpeg";
      form.append("file", new Blob([file.content], { type: mimeType }), file.name);
    }
    try {
      const response = await fetchImpl(`https://api.cloudinary.com/v1_1/${config.cloud}/image/${action}`, {
        method: "POST", body: form, signal: AbortSignal.timeout(timeout), redirect: "error",
      });
      const data = JSON.parse((await bodyBytes(response, 65536)).toString("utf8"));
      if (!response.ok) throw unavailable();
      return data;
    } catch { throw storageError(); }
  };

const createCloudinaryPhotos = ({ env = process.env, fetchImpl = globalThis.fetch } = {}) => {
  const post = createImagePost(fetchImpl, () => configured(env), unavailable);
  const remove = async image => {
    if (!validPublicId(image.public_id)) throw unavailable();
    const result = await post("destroy", { public_id: image.public_id, type: "authenticated", invalidate: true }, null, 5000);
    if (!["ok", "not found"].includes(result.result)) throw unavailable();
  };
  return {
    async save(content) {
      configured(env);
      const publicId = `plantify/diagnoses/${randomUUID()}`;
      try {
        const result = await post("upload", { public_id: publicId, type: "authenticated", overwrite: false }, {
          content, extension: "jpg", name: "diagnosis.jpg",
        });
        if (result.public_id !== publicId || result.type !== "authenticated" || result.resource_type !== "image" ||
            result.format !== "jpg" || typeof result.asset_id !== "string" || !/^[\w-]{1,128}$/.test(result.asset_id)) throw unavailable();
        return { storage: "cloudinary", public_id: publicId, asset_id: result.asset_id };
      } catch (error) {
        // Request có thể đã upload xong trước khi mất kết nối; dọn đúng public_id vừa tạo.
        await remove({ public_id: publicId }).catch(() => console.error("[Diagnosis] Không dọn được ảnh Cloudinary chưa lưu lịch sử."));
        throw error;
      }
    },
    remove,
    async read(image) {
      const config = configured(env);
      if (!validPublicId(image.public_id) || typeof image.asset_id !== "string" || !/^[\w-]{1,128}$/.test(image.asset_id))
        throw new AppError("DIAGNOSIS_IMAGE_NOT_FOUND", 404, "Ảnh chẩn đoán không còn khả dụng.");
      const timestamp = Math.floor(Date.now() / 1000);
      const params = { asset_id: image.asset_id, timestamp, expires_at: timestamp + 60 };
      const url = new URL(`https://api.cloudinary.com/v1_1/${config.cloud}/asset/download`);
      for (const [key, value] of Object.entries({ ...params, api_key: config.key, signature: sign(params, config.secret) }))
        url.searchParams.set(key, String(value));
      try {
        const response = await fetchImpl(url, { signal: AbortSignal.timeout(20000), redirect: "error" });
        if (response.status === 404) throw new AppError("DIAGNOSIS_IMAGE_NOT_FOUND", 404, "Ảnh chẩn đoán không còn khả dụng.");
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/jpeg")) throw unavailable();
        return await bodyBytes(response, 10 * 1024 * 1024);
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw unavailable();
      }
    },
  };
};

const gardenUnavailable = () => new AppError("GARDEN_PHOTO_STORAGE_UNAVAILABLE", 503, "Chưa kết nối được nơi lưu ảnh vườn. Vui lòng thử lại.");
const gardenNotConfigured = () => new AppError("GARDEN_PHOTO_NOT_CONFIGURED", 503, "Nơi lưu ảnh vườn chưa được cấu hình đầy đủ.");

const createPublicPhotos = (folder, configurationError, storageError, {
  env = process.env, fetchImpl = globalThis.fetch,
} = {}) => {
  const getConfig = () => configured(env, configurationError);
  const post = createImagePost(fetchImpl, getConfig, storageError);
  const publicIdPattern = new RegExp(`^plantify/${folder}/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$`);
  const remove = async ({ publicId }) => {
    if (typeof publicId !== "string" || !publicIdPattern.test(publicId)) throw storageError();
    const result = await post("destroy", { public_id: publicId, type: "upload", invalidate: true }, null, 5000);
    if (!["ok", "not found"].includes(result?.result)) throw storageError();
  };
  return {
    async save(content, extension) {
      getConfig();
      const publicId = `plantify/${folder}/${randomUUID()}`;
      try {
        const result = await post("upload", { public_id: publicId, type: "upload", overwrite: false }, {
          content, extension, name: `plant.${extension}`,
        });
        if (result?.public_id !== publicId || result.type !== "upload" || result.resource_type !== "image" ||
            typeof result.secure_url !== "string" || !/^https:\/\/[^\s/]+\/\S+$/i.test(result.secure_url))
          throw storageError();
        return { publicId, url: result.secure_url };
      } catch (error) {
        await remove({ publicId }).catch(() => console.error(`[Cloudinary] Không dọn được ảnh vừa tải lên (${folder}).`));
        throw error;
      }
    },
    remove,
  };
};

const createGardenPhotos = options => createPublicPhotos("garden", gardenNotConfigured, gardenUnavailable, options);
const plantUnavailable = () => new AppError("PLANT_PHOTO_STORAGE_UNAVAILABLE", 503, "Chưa kết nối được nơi lưu ảnh cây. Vui lòng thử lại.");
const plantNotConfigured = () => new AppError("PLANT_PHOTO_NOT_CONFIGURED", 503, "Nơi lưu ảnh cây chưa được cấu hình đầy đủ.");
const createPlantPhotos = options => createPublicPhotos("plants", plantNotConfigured, plantUnavailable, options);

module.exports = { ...createCloudinaryPhotos(), createCloudinaryPhotos, createGardenPhotos, createPlantPhotos };
