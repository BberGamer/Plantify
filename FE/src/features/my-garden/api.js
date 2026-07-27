// api.js - Gọi API quản lý cây và sự kiện chăm sóc trong My Garden
import { api } from "@/lib/api";

const MY_GARDEN_API = "/my-garden";

/**
 * Tạo một cây mới trong My Garden.
 * @param {Object} payload - Dữ liệu cây người dùng.
 * @returns {Promise<Object>} Dữ liệu cây vừa tạo.
 */
export async function createUserPlant(payload) {
  const response = await api.post(MY_GARDEN_API, payload);
  return response.data;
}

/**
 * Lấy toàn bộ cây trong My Garden của người dùng hiện tại.
 * @param {AbortSignal} [signal] - Signal hủy request.
 * @returns {Promise<Object>} Dữ liệu My Garden từ API.
 */
export async function getMyGarden(signal) {
  const response = await api.get(MY_GARDEN_API, { signal });
  return response.data;
}

/**
 * Lấy chi tiết một cây người dùng.
 * @param {string} userPlantId - ID cây trong My Garden.
 * @param {AbortSignal} [signal] - Signal hủy request.
 * @returns {Promise<Object>} Dữ liệu chi tiết cây.
 */
export async function getUserPlantById(userPlantId, signal) {
  const response = await api.get(`${MY_GARDEN_API}/${userPlantId}`, { signal });
  return response.data;
}

/**
 * Lấy dữ liệu tổng hợp cho dashboard My Garden.
 * @param {AbortSignal} [signal] - Signal hủy request.
 * @returns {Promise<Object>} Dữ liệu dashboard.
 */
export async function getMyGardenDashboard(signal) {
  const response = await api.get(`${MY_GARDEN_API}/dashboard`, { signal });
  return response.data;
}

/**
 * Lấy gợi ý chăm sóc dựa trên thời tiết của thành phố.
 * @param {string} city - Tên thành phố cần tra cứu.
 * @param {AbortSignal} [signal] - Signal hủy request.
 * @returns {Promise<Object>} Dữ liệu thời tiết và gợi ý chăm sóc.
 */
export async function getMyGardenWeatherAdvice(city, signal) {
  const response = await api.get(`${MY_GARDEN_API}/weather-advice`, {
    params: { city },
    signal,
  });
  return response.data;
}

/**
 * Cập nhật thông tin một cây trong My Garden.
 * @param {string} userPlantId - ID cây cần cập nhật.
 * @param {Object} payload - Các trường cần cập nhật.
 * @returns {Promise<Object>} Dữ liệu cây sau cập nhật.
 */
export async function updateUserPlant(userPlantId, payload) {
  const response = await api.patch(`${MY_GARDEN_API}/${userPlantId}`, payload);
  return response.data;
}

/**
 * Xóa một cây khỏi My Garden.
 * @param {string} userPlantId - ID cây cần xóa.
 * @returns {Promise<Object>} Kết quả xóa từ API.
 */
export async function deleteUserPlant(userPlantId) {
  const response = await api.delete(`${MY_GARDEN_API}/${userPlantId}`);
  return response.data;
}

/**
 * Tải một ảnh lên album của cây và chuyển tiếp tiến độ upload.
 * @param {string} userPlantId - ID cây sở hữu album.
 * @param {FormData} formData - FormData chứa tệp ảnh.
 * @param {Function} [onUploadProgress] - Callback nhận tiến độ upload.
 * @returns {Promise<Object>} Dữ liệu ảnh vừa tải lên.
 */
export async function uploadUserPlantImage(userPlantId, formData, onUploadProgress) {
  const response = await api.post(`${MY_GARDEN_API}/${userPlantId}/images`, formData, {
    onUploadProgress,
  });
  return response.data;
}

/**
 * Cập nhật metadata của một ảnh trong album cây.
 * @param {string} userPlantId - ID cây sở hữu ảnh.
 * @param {string} imageId - ID ảnh cần cập nhật.
 * @param {Object} payload - Metadata ảnh mới.
 * @returns {Promise<Object>} Dữ liệu ảnh sau cập nhật.
 */
export async function updateUserPlantImage(userPlantId, imageId, payload) {
  const response = await api.patch(`${MY_GARDEN_API}/${userPlantId}/images/${imageId}`, payload);
  return response.data;
}

/**
 * Xóa một ảnh khỏi album cây.
 * @param {string} userPlantId - ID cây sở hữu ảnh.
 * @param {string} imageId - ID ảnh cần xóa.
 * @returns {Promise<Object>} Kết quả xóa từ API.
 */
export async function deleteUserPlantImage(userPlantId, imageId) {
  const response = await api.delete(`${MY_GARDEN_API}/${userPlantId}/images/${imageId}`);
  return response.data;
}

/**
 * Lấy lịch sử chăm sóc của một cây.
 * @param {string} userPlantId - ID cây cần lấy lịch sử.
 * @returns {Promise<Object>} Danh sách sự kiện chăm sóc.
 */
export async function getCareEvents(userPlantId) { const response = await api.get(`${MY_GARDEN_API}/${userPlantId}/care-events`); return response.data; }
/**
 * Ghi nhận một sự kiện chăm sóc mới cho cây.
 * @param {string} userPlantId - ID cây được chăm sóc.
 * @param {Object} payload - Nội dung sự kiện chăm sóc.
 * @returns {Promise<Object>} Sự kiện vừa tạo.
 */
export async function createCareEvent(userPlantId, payload) { const response = await api.post(`${MY_GARDEN_API}/${userPlantId}/care-events`, payload); return response.data; }
/**
 * Xóa một sự kiện khỏi lịch sử chăm sóc.
 * @param {string} userPlantId - ID cây sở hữu sự kiện.
 * @param {string} eventId - ID sự kiện cần xóa.
 * @returns {Promise<Object>} Kết quả xóa từ API.
 */
export async function deleteCareEvent(userPlantId, eventId) { const response = await api.delete(`${MY_GARDEN_API}/${userPlantId}/care-events/${eventId}`); return response.data; }
