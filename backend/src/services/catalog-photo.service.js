const { randomInt } = require("node:crypto");

const distinctUrls = (urls) => [...new Set(urls.filter(
  (url) => typeof url === "string" && url.trim(),
).map((url) => url.trim()))];

function catalogImageUrls(record, coverField) {
  const legacy = Array.isArray(record.example_images) ? record.example_images : [];
  return distinctUrls(Array.isArray(record.image_urls)
    ? record.image_urls
    : [record[coverField], ...legacy.map((row) => row?.image_url)]);
}

function imageFields(data, current, coverField) {
  let urls = data.image_urls;
  if (urls === undefined && Array.isArray(current?.image_urls) && data[coverField] !== undefined) {
    const remaining = current.image_urls.filter((url) => url !== current[coverField]);
    urls = [data[coverField], ...remaining];
  }
  if (urls === undefined) return {};
  const images = distinctUrls(urls);
  return { image_urls: images, [coverField]: images[0] || "", example_images: undefined };
}

function sampleCatalogImages(record, coverField) {
  const urls = catalogImageUrls(record, coverField);
  const count = Math.min(3, urls.length);
  for (let i = 0; i < count; i++) {
    const index = randomInt(i, urls.length);
    [urls[i], urls[index]] = [urls[index], urls[i]];
  }
  return urls.slice(0, count);
}

async function saveWithPhotos(data, files, photos, imageField, save) {
  if (!files || !Object.keys(files).length) return save(data);

  const payload = { ...data };
  const uploaded = [];
  const upload = async (file) => {
    const photo = await photos.save(file.buffer, file.extension);
    uploaded.push(photo);
    return photo.url;
  };
  try {
    if (files.photo) payload[imageField] = await upload(files.photo[0]);
    if (files.photos?.length) {
      const results = await Promise.allSettled(files.photos.map(upload));
      const failure = results.find((result) => result.status === "rejected");
      if (failure) throw failure.reason;
      let index = 0;
      payload.image_urls = payload.image_urls.map((url) =>
        url === null ? results[index++].value : url,
      );
    }
    return await save(payload);
  } catch (error) {
    const cleanup = await Promise.allSettled(uploaded.map((photo) => photos.remove(photo)));
    if (cleanup.some((result) => result.status === "rejected"))
      console.error("[Cloudinary] Không dọn được ảnh sau khi lưu thất bại.");
    throw error;
  }
}

module.exports = { saveWithPhotos, catalogImageUrls, imageFields, sampleCatalogImages };
