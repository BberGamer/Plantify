// myGarden.utils.js - Helper hiển thị và chuẩn hóa dữ liệu My Garden
export const DEFAULT_IMAGE = "/default-plant.svg";
export const MAX_ALBUM_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALBUM_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function toLocalDateTimeInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function toLocalDateTimeInputWithSeconds(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 19);
}

export function localDateTimeToIso(value) {
  return new Date(value).toISOString();
}

export function sortCareEvents(events) {
  return [...events].sort(
    (left, right) => new Date(right.performedAt) - new Date(left.performedAt)
  );
}

export function getCareEventCapabilities(readOnly) {
  return {
    canCreate: !readOnly,
    canEdit: false,
    canDelete: !readOnly,
  };
}

export function addUtcMonths(value, months) {
  const result = new Date(value);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    0
  )).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export function getScheduleDateBounds(now = new Date()) {
  return {
    min: toLocalDateTimeInputWithSeconds(
      new Date(now.getTime() + 60 * 1000)
    ),
    max: toLocalDateTimeInputWithSeconds(addUtcMonths(now, 12)),
  };
}

export function normalizeUserPlantSchedule(schedule = {}) {
  return {
    enabled: schedule.enabled === true,
    frequencyDays: schedule.frequencyDays ?? "",
    lastCompletedAt: schedule.lastCompletedAt || null,
    nextDueAt: schedule.nextDueAt
      ? toLocalDateTimeInputWithSeconds(schedule.nextDueAt)
      : "",
  };
}

export function validateUserPlantSchedule(schedule, label, now = new Date()) {
  if (!schedule?.enabled) {
    return {
      value: {
        enabled: false,
        frequencyDays: null,
        nextDueAt: null,
      },
      error: "",
    };
  }

  const frequencyDays = Number(schedule.frequencyDays);
  if (
    !Number.isInteger(frequencyDays)
    || frequencyDays < 1
    || frequencyDays > 365
  ) {
    return {
      value: null,
      error: `${label}: chu kỳ phải là số nguyên từ 1 đến 365 ngày.`,
    };
  }

  const nextDueAt = new Date(schedule.nextDueAt);
  if (!schedule.nextDueAt || Number.isNaN(nextDueAt.getTime())) {
    return {
      value: null,
      error: `${label}: lần nhắc tiếp theo không hợp lệ.`,
    };
  }
  const lowerBoundary = new Date(now);
  lowerBoundary.setMilliseconds(0);
  if (nextDueAt < lowerBoundary) {
    return {
      value: null,
      error: `${label}: lần nhắc tiếp theo không được ở quá khứ.`,
    };
  }
  if (nextDueAt > addUtcMonths(lowerBoundary, 12)) {
    return {
      value: null,
      error: `${label}: lần nhắc tiếp theo không được quá 12 tháng.`,
    };
  }

  return {
    value: {
      enabled: true,
      frequencyDays,
      nextDueAt: nextDueAt.toISOString(),
    },
    error: "",
  };
}

export function getUserPlantScheduleStatus(schedule, now = new Date()) {
  if (!schedule?.enabled) return "disabled";
  const nextDueAt = new Date(schedule.nextDueAt);
  if (Number.isNaN(nextDueAt.getTime())) return "invalid";
  if (nextDueAt < now) return "overdue";
  if (nextDueAt.toDateString() === now.toDateString()) return "today";
  return "upcoming";
}

export function isValidAlbumFile(file) {
  return Boolean(
    file
    && ALBUM_IMAGE_TYPES.includes(file.type)
    && file.size <= MAX_ALBUM_IMAGE_SIZE
  );
}

export function getAlbumCapabilities(readOnly) {
  return {
    canUpload: !readOnly,
    canEdit: !readOnly,
    canDelete: !readOnly,
  };
}

export function removePendingPreview(
  items,
  index,
  revoke = URL.revokeObjectURL
) {
  const item = items[index];
  if (item?.preview) revoke(item.preview);
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function revokePendingPreviews(
  items,
  revoke = URL.revokeObjectURL
) {
  items.forEach((item) => {
    if (item?.preview) revoke(item.preview);
  });
}

export async function createUserPlantThenUpload({
  createPlant,
  uploadImage,
  payload,
  files,
  onProgress,
}) {
  const userPlant = await createPlant(payload);
  let failedUploads = 0;
  for (let index = 0; index < files.length; index += 1) {
    try {
      await uploadImage(userPlant._id, files[index], (value) => {
        onProgress?.(Math.round(
          ((index + value / 100) / files.length) * 100
        ));
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
  const fallbackSource = getImageFallbackSource(
    image.getAttribute("src") || image.src
  );
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
