async function saveWithPhoto(data, file, photos, imageField, save) {
  if (!file) return save(data);

  const photo = await photos.save(file.buffer, file.extension);
  try {
    return await save({ ...data, [imageField]: photo.url });
  } catch (error) {
    await photos.remove(photo).catch(() => {
      console.error("[Cloudinary] Không dọn được ảnh sau khi lưu thất bại.");
    });
    throw error;
  }
}

module.exports = { saveWithPhoto };
