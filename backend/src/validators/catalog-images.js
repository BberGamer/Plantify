const v = require("./common");

const MAX_PHOTOS_PER_SAVE = 6;

function normalizeImageUrls(value, uploadCount = 0) {
  if (value === undefined && !uploadCount) return undefined;
  if (!Array.isArray(value))
    v.invalid("image_urls", "Danh sách ảnh không hợp lệ.");
  if (value.filter((url) => url === null).length !== uploadCount)
    v.invalid("image_urls", "Số ảnh tải lên không khớp với thư viện ảnh.");
  return value.map((url) => {
    if (url === null) return null;
    const address = typeof url === "string" ? url.trim() : "";
    let parsed;
    try { parsed = new URL(address); } catch {}
    if (address.length > 2048 || !/^https?:\/\/\S+$/i.test(address) ||
        !parsed?.hostname || parsed.username || parsed.password)
      v.invalid("image_urls", "Ảnh phải có đường dẫn HTTP hoặc HTTPS hợp lệ.");
    return address;
  });
}

module.exports = { MAX_PHOTOS_PER_SAVE, normalizeImageUrls };
