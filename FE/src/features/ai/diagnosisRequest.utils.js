// diagnosisRequest.utils.js - Tạo dữ liệu biểu mẫu gửi ảnh và cây liên kết để chẩn đoán
/**
 * Tạo FormData chẩn đoán và chỉ gắn userPlantId khi có liên kết My Garden.
 * @param {File} file - Ảnh cây cần chẩn đoán.
 * @param {Object} [options={}] - Tùy chọn request.
 * @param {string} [options.userPlantId] - ID cây liên kết.
 * @returns {FormData} Payload multipart cho API chẩn đoán.
 */
export function buildDiagnosisFormData(file, { userPlantId } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (userPlantId) formData.append("userPlantId", userPlantId);
  return formData;
}
