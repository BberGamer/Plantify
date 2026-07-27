// myGarden.utils.js - Helper hiển thị và chuẩn hóa dữ liệu My Garden
export const DEFAULT_IMAGE = "/default-plant.svg";

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

export function getApiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}
