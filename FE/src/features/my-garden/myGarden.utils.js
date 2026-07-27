// myGarden.utils.js - Helper hiển thị và chuẩn hóa dữ liệu My Garden
export const DEFAULT_IMAGE = "/default-plant.svg";
export const MAX_ALBUM_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALBUM_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function toLocalDateTimeInput(value = new Date()) { const date = value instanceof Date ? value : new Date(value); const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
export function localDateTimeToIso(value) { return new Date(value).toISOString(); }
export function sortCareEvents(events) { return [...events].sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt)); }
export function getCareEventCapabilities(readOnly) { return { canCreate: !readOnly, canEdit: !readOnly, canDelete: !readOnly }; }

export function validateCareEventPerformedAt(
  value,
  userPlantCreatedAt,
  now = new Date()
) {
  if (!value) {
    return { error: "Thời gian thực hiện không hợp lệ.", performedAt: "" };
  }
  const valueDate = new Date(value);
  if (Number.isNaN(valueDate.getTime())) {
    return { error: "Thời gian thực hiện không hợp lệ.", performedAt: "" };
  }
  const createdAt = new Date(userPlantCreatedAt);
  if (!Number.isNaN(createdAt.getTime()) && valueDate < createdAt) {
    return {
      error: "Thời gian thực hiện không được trước ngày tạo cây.",
      performedAt: "",
    };
  }
  if (valueDate > now) {
    return {
      error: "Thời gian thực hiện không được ở tương lai.",
      performedAt: "",
    };
  }
  return { error: "", performedAt: valueDate.toISOString() };
}

export function isValidAlbumFile(file) {
  return Boolean(file && ALBUM_IMAGE_TYPES.includes(file.type) && file.size <= MAX_ALBUM_IMAGE_SIZE);
}

export function getAlbumCapabilities(readOnly) {
  return { canUpload: !readOnly, canEdit: !readOnly, canDelete: !readOnly };
}

export function removePendingPreview(items, index, revoke = URL.revokeObjectURL) {
  const item = items[index];
  if (item?.preview) revoke(item.preview);
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function revokePendingPreviews(items, revoke = URL.revokeObjectURL) {
  items.forEach((item) => { if (item?.preview) revoke(item.preview); });
}

export async function createUserPlantThenUpload({ createPlant, uploadImage, payload, files, onProgress }) {
  const userPlant = await createPlant(payload);
  let failedUploads = 0;
  for (let index = 0; index < files.length; index += 1) {
    try {
      await uploadImage(userPlant._id, files[index], (value) => {
        onProgress?.(Math.round(((index + value / 100) / files.length) * 100));
      });
    } catch {
      failedUploads += 1;
    }
  }
  return { userPlant, failedUploads };
}

export function getUserPlantImage(userPlant = {}) {
  return userPlant.coverImageUrl
    || userPlant.catalogPlantId?.thumbnail
    || userPlant.catalogPlantId?.images?.[0]
    || DEFAULT_IMAGE;
}

export function getImageFallbackSource(currentSource = "") {
  const normalizedSource = String(currentSource).split("?")[0];

  return normalizedSource.endsWith(DEFAULT_IMAGE) ? null : DEFAULT_IMAGE;
}

export function handleUserPlantImageError(event) {
  const image = event.currentTarget;
  const fallbackSource = getImageFallbackSource(image.getAttribute("src") || image.src);

  if (!fallbackSource) {
    image.onerror = null;
    return;
  }

  image.src = fallbackSource;
}

export function buildUserPlantPayload(form = {}) {
  return {
    name: String(form.name || "").trim(),
    catalogPlantId: form.catalogPlantId || null,
    notes: String(form.notes || "").trim(),
  };
}

export function buildPlantDiagnosisUrl(userPlantId, historyId = "") {
  const searchParams = new URLSearchParams();
  searchParams.set("userPlantId", userPlantId);
  if (historyId) searchParams.set("historyId", historyId);
  return `/ai-doctor?${searchParams.toString()}`;
}

export function getApiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}
