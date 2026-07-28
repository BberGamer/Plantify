// ai.controller.js - Xử lý request chẩn đoán bệnh cây bằng AI
const {
  orchestrateDiagnosis,
} = require('./aiDiagnosisOrchestrator.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * POST /api/ai/diagnose - Chẩn đoán, match knowledge base và lưu lịch sử.
 */
async function diagnosePlantDisease(req, res, next) {
  try {
    if (!req.file) {
      return apiResponse.error(res, 'Vui lòng tải lên ảnh cây để chẩn đoán.', 400);
    }

    const result = await orchestrateDiagnosis({
      userId: req.user.id,
      file: req.file,
      userPlantId: req.body?.userPlantId,
    });

    return apiResponse.success(res, 'Chẩn đoán thành công', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  diagnosePlantDisease,
};
