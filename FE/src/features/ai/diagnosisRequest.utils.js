// diagnosisRequest.utils.js - Tạo dữ liệu biểu mẫu gửi ảnh và cây liên kết để chẩn đoán
export function buildDiagnosisFormData(file, { userPlantId } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (userPlantId) formData.append("userPlantId", userPlantId);
  return formData;
}
