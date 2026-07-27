// myGarden.utils.js - Helper hiển thị và chuẩn hóa dữ liệu My Garden
export const DEFAULT_IMAGE = "/default-plant.svg";
export const MAX_ALBUM_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALBUM_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Chuyển thời điểm sang chuỗi `datetime-local` theo múi giờ máy người dùng. @param {Date|string} [value=new Date()] - Thời điểm cần chuyển. @returns {string} Chuỗi đến phút. */
export function toLocalDateTimeInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** Chuyển thời điểm sang chuỗi `datetime-local` có giây theo múi giờ máy người dùng. @param {Date|string} [value=new Date()] - Thời điểm cần chuyển. @returns {string} Chuỗi đến giây. */
export function toLocalDateTimeInputWithSeconds(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 19);
}

/** Chuyển giá trị `datetime-local` thành ISO UTC. @param {string} value - Giá trị local. @returns {string} Chuỗi ISO. */
export function localDateTimeToIso(value) {
  return new Date(value).toISOString();
}

/** Sắp xếp sự kiện chăm sóc mới nhất trước. @param {Object[]} events - Danh sách sự kiện. @returns {Object[]} Bản sao danh sách đã sắp xếp. */
export function sortCareEvents(events) {
  return [...events].sort(
    (left, right) => new Date(right.performedAt) - new Date(left.performedAt)
  );
}

/** Xác định các thao tác sự kiện chăm sóc được phép trong chế độ hiện tại. @param {boolean} readOnly - Có phải chế độ chỉ đọc không. @returns {Object} Các cờ quyền tạo, sửa và xóa. */
export function getCareEventCapabilities(readOnly) {
  return {
    canCreate: false,
    canEdit: false,
    canDelete: !readOnly,
  };
}

/** Cộng số tháng UTC và giữ ngày hợp lệ ở cuối tháng. @param {Date|string} value - Thời điểm gốc. @param {number} months - Số tháng cần cộng. @returns {Date} Thời điểm sau khi cộng. */
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

/** Tính giới hạn ngày nhắc lịch từ một phút tới mười hai tháng. @param {Date} [now=new Date()] - Thời điểm tham chiếu. @returns {Object} Chuỗi min/max cho input. */
export function getScheduleDateBounds(now = new Date()) {
  return {
    min: toLocalDateTimeInputWithSeconds(
      new Date(now.getTime() + 60 * 1000)
    ),
    max: toLocalDateTimeInputWithSeconds(addUtcMonths(now, 12)),
  };
}

/** Chuẩn hóa lịch chăm sóc từ API sang dữ liệu form. @param {Object} [schedule={}] - Lịch chăm sóc. @returns {Object} Lịch đã chuẩn hóa. */
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

/** Validate lịch chăm sóc và chuyển ngày hợp lệ sang ISO. @param {Object} schedule - Lịch cần kiểm tra. @param {string} label - Nhãn dùng trong thông báo lỗi. @param {Date} [now=new Date()] - Thời điểm tham chiếu. @returns {{value: Object|null, error: string}} Kết quả validate. */
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

/** Xác định trạng thái lịch chăm sóc tại thời điểm hiện tại. @param {Object} schedule - Lịch chăm sóc. @param {Date} [now=new Date()] - Thời điểm tham chiếu. @returns {string} Trạng thái disabled, invalid, overdue, today hoặc upcoming. */
export function getUserPlantScheduleStatus(schedule, now = new Date()) {
  if (!schedule?.enabled) return "disabled";
  const nextDueAt = new Date(schedule.nextDueAt);
  if (Number.isNaN(nextDueAt.getTime())) return "invalid";
  if (nextDueAt < now) return "overdue";
  if (nextDueAt.toDateString() === now.toDateString()) return "today";
  return "upcoming";
}

/** Kiểm tra loại và kích thước tệp ảnh album. @param {File} file - Tệp cần kiểm tra. @returns {boolean} Tệp có hợp lệ hay không. */
export function isValidAlbumFile(file) {
  return Boolean(
    file
    && ALBUM_IMAGE_TYPES.includes(file.type)
    && file.size <= MAX_ALBUM_IMAGE_SIZE
  );
}

/** Xác định quyền thao tác album theo chế độ chỉ đọc. @param {boolean} readOnly - Có phải chế độ chỉ đọc không. @returns {Object} Các cờ upload, sửa và xóa. */
export function getAlbumCapabilities(readOnly) {
  return {
    canUpload: !readOnly,
    canEdit: !readOnly,
    canDelete: !readOnly,
  };
}

/** Xóa preview đang chờ và revoke Object URL tương ứng. @param {Object[]} items - Danh sách preview. @param {number} index - Vị trí cần xóa. @param {Function} [revoke=URL.revokeObjectURL] - Hàm giải phóng URL. @returns {Object[]} Danh sách còn lại. */
export function removePendingPreview(
  items,
  index,
  revoke = URL.revokeObjectURL
) {
  const item = items[index];
  if (item?.preview) revoke(item.preview);
  return items.filter((_, itemIndex) => itemIndex !== index);
}

/** Revoke toàn bộ Object URL đang chờ để tránh rò rỉ bộ nhớ. @param {Object[]} items - Danh sách preview. @param {Function} [revoke=URL.revokeObjectURL] - Hàm giải phóng URL. @returns {void} */
export function revokePendingPreviews(
  items,
  revoke = URL.revokeObjectURL
) {
  items.forEach((item) => {
    if (item?.preview) revoke(item.preview);
  });
}

/**
 * Tạo cây trước rồi tải tuần tự các ảnh lên album; lỗi ảnh không xóa cây vừa tạo.
 * @param {Object} options - Các dependency và dữ liệu xử lý.
 * @param {Function} options.createPlant - Hàm tạo cây.
 * @param {Function} options.uploadImage - Hàm tải ảnh.
 * @param {Object} options.payload - Payload tạo cây.
 * @param {File[]} options.files - Danh sách ảnh.
 * @param {Function} [options.onProgress] - Callback phần trăm tiến độ.
 * @returns {Promise<{userPlant: Object, failedUploads: number}>} Cây vừa tạo và số ảnh lỗi.
 */
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

/** Chọn ảnh đại diện theo thứ tự cover, catalogue và ảnh mặc định. @param {Object} [userPlant={}] - Cây người dùng. @returns {string} URL ảnh hiển thị. */
export function getUserPlantImage(userPlant = {}) {
  return userPlant.coverImageUrl
    || userPlant.catalogPlantId?.thumbnail
    || userPlant.catalogPlantId?.images?.[0]
    || DEFAULT_IMAGE;
}

/** Lấy ảnh fallback nếu nguồn hiện tại chưa phải ảnh mặc định. @param {string} [currentSource=""] - URL ảnh hiện tại. @returns {string|null} Ảnh mặc định hoặc `null`. */
export function getImageFallbackSource(currentSource = "") {
  const normalizedSource = String(currentSource).split("?")[0];
  return normalizedSource.endsWith(DEFAULT_IMAGE) ? null : DEFAULT_IMAGE;
}

/** Thay ảnh lỗi bằng ảnh mặc định đúng một lần. @param {Event} event - Sự kiện lỗi của thẻ ảnh. @returns {void} */
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

/** Tạo payload cây chỉ từ các trường form được API chấp nhận. @param {Object} [form={}] - Dữ liệu form. @returns {Object} Payload đã trim và chuẩn hóa. */
export function buildUserPlantPayload(form = {}) {
  return {
    name: String(form.name || "").trim(),
    catalogPlantId: form.catalogPlantId || null,
    notes: String(form.notes || "").trim(),
  };
}

/** Tạo URL AI Doctor gắn với cây và tùy chọn lịch sử chẩn đoán. @param {string} userPlantId - ID cây. @param {string} [historyId=""] - ID lịch sử. @returns {string} URL AI Doctor. */
export function buildPlantDiagnosisUrl(userPlantId, historyId = "") {
  const searchParams = new URLSearchParams();
  searchParams.set("userPlantId", userPlantId);
  if (historyId) searchParams.set("historyId", historyId);
  return `/ai-doctor?${searchParams.toString()}`;
}

/** Lấy thông báo lỗi ưu tiên từ response, Error rồi fallback. @param {Object} error - Lỗi request. @param {string} fallback - Thông báo dự phòng. @returns {string} Thông báo lỗi. */
export function getApiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}
