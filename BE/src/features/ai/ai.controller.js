// ai.controller.js - Xử lý request liên quan đến AI (chat, chẩn đoán bệnh cây)
const aiService = require('./ai.service');
const apiResponse = require('../../utils/apiResponse');
/**
 * POST /api/ai/chat - Gọi Gemini AI để trả lời câu hỏi.
 */
async function generateText(req, res, next) {
  try {
    const result = await aiService.generateText(req.body.prompt);
    return apiResponse.success(res, 'Goi Gemini thanh cong', result);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/ai/diagnose - Chẩn đoán bệnh cây từ ảnh.
 */
async function diagnosePlantDisease(req, res, next) {
  try {
    if (!req.file) {
      return apiResponse.error(res, 'Vui lòng upload ảnh lá cây để chẩn đoán.', 400);
    }

    const { buffer, originalname, mimetype } = req.file;
    const prediction = await aiService.diagnoseFromImage(buffer, originalname, mimetype);

    return apiResponse.success(res, 'Chẩn đoán thành công', { prediction });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateText,
  diagnosePlantDisease,
};
