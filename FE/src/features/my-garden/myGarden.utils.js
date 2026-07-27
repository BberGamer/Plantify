// myGarden.utils.js - Helper hiển thị và chuẩn hóa dữ liệu My Garden
export const DEFAULT_IMAGE = "/default-product.svg";

export function getUserPlantImage(userPlant = {}) {
  return userPlant.coverImageUrl
    || userPlant.catalogPlantId?.thumbnail
    || userPlant.catalogPlantId?.images?.[0]
    || DEFAULT_IMAGE;
}

export function buildUserPlantPayload(form = {}) {
  return {
    name: String(form.name || "").trim(),
    catalogPlantId: form.catalogPlantId || null,
    coverImageUrl: String(form.coverImageUrl || "").trim(),
    notes: String(form.notes || "").trim(),
  };
}

export function getApiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}
