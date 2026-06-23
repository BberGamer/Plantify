// aiDiagnosisService.js - Gửi ảnh đến FastAPI AI Service và nhận kết quả dự đoán
const axios = require('axios');
const FormData = require('form-data');

const FASTAPI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const PREDICT_ENDPOINT = `${FASTAPI_URL}/predict`;
const TIMEOUT = 60000; // 60 seconds for model inference

/**
 * Chẩn đoán bệnh cây bằng AI từ ảnh.
 * @param {Buffer} imageBuffer - Buffer của ảnh upload
 * @param {string} filename - Tên file ảnh
 * @param {string} mimeType - MIME type của ảnh
 * @returns {Promise<{label: string, confidence: number}>}
 */
async function diagnoseFromImage(imageBuffer, filename, mimeType) {
  const formData = new FormData();
  formData.append('file', imageBuffer, {
    filename: filename || 'image.jpg',
    contentType: mimeType || 'image/jpeg',
  });

  try {
    const response = await axios.post(PREDICT_ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: TIMEOUT,
    });

    const { class_id, label, confidence } = response.data;

    return {
      classId: class_id,
      label,
      confidence: confidence,
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      const err = new Error('AI service không khả dụng. Vui lòng khởi động AI Service.');
      err.statusCode = 503;
      throw err;
    }

    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      const err = new Error('Yêu cầu chẩn đoán hết thời gian. Vui lòng thử lại.');
      err.statusCode = 504;
      throw err;
    }

    if (error.response?.status === 400) {
      const err = new Error(error.response.data?.detail || 'File ảnh không hợp lệ.');
      err.statusCode = 400;
      throw err;
    }

    const err = new Error(error.response?.data?.detail || 'Chẩn đoán thất bại.');
    err.statusCode = 500;
    throw err;
  }
}

module.exports = {
  diagnoseFromImage,
};
