// plantDiseaseForm.utils.js - Chuyển đổi dữ liệu mảng của PlantDisease cho textarea

export const DISEASE_CATEGORY_OPTIONS = [
  { value: "disease", label: "Bệnh do nấm / vi khuẩn / virus" },
  { value: "pest", label: "Sâu bệnh / côn trùng" },
  { value: "nutrient", label: "Dinh dưỡng" },
  { value: "environment", label: "Môi trường" },
];

/**
 * Chuẩn hóa tên bệnh thành canonical key dạng kebab-case ASCII.
 * @param {string} value - Tên bệnh hoặc key đang nhập
 * @returns {string} Canonical key
 */
export function normalizeDiseaseKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Lấy nhãn tiếng Việt của category bệnh.
 * @param {string} category - Giá trị category canonical
 * @returns {string} Nhãn hiển thị
 */
export function getDiseaseCategoryLabel(category) {
  return DISEASE_CATEGORY_OPTIONS.find(
    (option) => option.value === category
  )?.label || "Chưa xác định";
}

/**
 * Lấy ID string từ một MongoDB reference đã populate hoặc ID thuần.
 * @param {object|string} value - Object đã populate hoặc ID
 * @returns {string} ID dùng trong form
 */
export function getReferenceId(value) {
  const referenceId = typeof value === "object" && value !== null
    ? value._id || value.id
    : value;

  return referenceId ? String(referenceId) : "";
}

/**
 * Chuyển mảng kiến thức bệnh thành nội dung textarea, mỗi ý một dòng.
 * @param {string|string[]} value - Dữ liệu từ API
 * @returns {string} Nội dung hiển thị trong textarea
 */
export function listToTextarea(value) {
  if (Array.isArray(value)) return value.join("\n");
  return typeof value === "string" ? value : "";
}

/**
 * Chuyển nội dung textarea thành mảng string đã loại bỏ dòng trống.
 * @param {string} value - Nội dung người dùng nhập
 * @returns {string[]} Danh sách kiến thức bệnh
 */
export function textareaToList(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
