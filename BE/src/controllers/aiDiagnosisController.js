// aiDiagnosisController.js - Xử lý request chẩn đoán bệnh cây bằng AI
const aiDiagnosisService = require('../services/aiDiagnosisService');
const apiResponse = require('../../utils/apiResponse');

/**
 * Xử lý request POST /api/ai/diagnose.
 * Nhận ảnh upload, gửi đến AI service, trả về kết quả dự đoán.
 */
async function diagnosePlantDisease(req, res, next) {
  try {
    // Validate file exists in request
    if (!req.file) {
      return apiResponse.error(res, 'Vui lòng upload ảnh lá cây để chẩn đoán.', 400);
    }

    const { buffer, originalname, mimetype } = req.file;

    // Gọi AI service để chẩn đoán
    const prediction = await aiDiagnosisService.diagnoseFromImage(
      buffer,
      originalname,
      mimetype
    );

    return apiResponse.success(res, 'Chẩn đoán thành công', { prediction });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  diagnosePlantDisease,
};
