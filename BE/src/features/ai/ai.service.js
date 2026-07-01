// ai.service.js - Xử lý business logic liên quan đến AI (chat, chẩn đoán bệnh cây)
const axios = require('axios');
const FormData = require('form-data');
const { createAIProvider } = require('../../lib/ai/aiFactory');

// === Gemini AI (chat) ===

async function generateText(prompt) {
  const provider = createAIProvider();
  return await provider.generateText(prompt);
}

// === AI Diagnosis (chẩn đoán bệnh cây) ===

const FASTAPI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const PREDICT_ENDPOINT = `${FASTAPI_URL}/predict`;
const TIMEOUT = 60000; // 60 seconds for model inference
const DISEASE_DESCRIPTIONS = {
  Aloe_Anthracnose: 'Bệnh thán thư trên nha đam gây các đốm sẫm màu, làm mô lá khô dần và có thể lan rộng nếu độ ẩm cao.',
  Aloe_Healthy: 'Lá nha đam không ghi nhận dấu hiệu bệnh rõ rệt, bề mặt lá nhìn chung vẫn ổn định và khỏe mạnh.',
  Aloe_LeafSpot: 'Đốm lá trên nha đam thường tạo các vết tròn hoặc bất định trên bề mặt lá, làm giảm thẩm mỹ và sức sống của cây.',
  Aloe_Rust: 'Bệnh gỉ sắt trên nha đam thường xuất hiện dưới dạng đốm nâu cam, có thể lan nhanh khi lá ẩm kéo dài.',
  Aloe_Sunburn: 'Cháy nắng trên nha đam làm lá bị bạc màu, khô hoặc cháy xém do tiếp xúc ánh nắng gắt quá lâu.',
  Cactus_Dactylopius_Opuntia: 'Xương rồng có dấu hiệu rệp sáp Dactylopius Opuntia, thường thấy các mảng trắng bám trên thân làm cây suy yếu dần.',
  Cactus_Healthy: 'Xương rồng không ghi nhận dấu hiệu bệnh nổi bật, bề mặt thân nhìn chung vẫn khỏe và ổn định.',
  Money_Plant_Bacterial_wilt_disease: 'Trầu bà có dấu hiệu héo rũ do vi khuẩn, cây có thể vàng lá, mềm thân và suy kiệt nhanh nếu không xử lý sớm.',
  Money_Plant_Healthy: 'Trầu bà không ghi nhận dấu hiệu bệnh rõ rệt, lá và thân hiện ở trạng thái tương đối khỏe mạnh.',
  Money_Plant_Manganese_Toxicity: 'Trầu bà có biểu hiện ngộ độc mangan, thường gây đổi màu lá và làm mô lá suy yếu khi môi trường trồng mất cân bằng.',
  Snake_Plant_Anthracnose: 'Lưỡi hổ có dấu hiệu thán thư với các vết bệnh sẫm màu, dễ lan rộng khi môi trường ẩm và thông gió kém.',
  Snake_Plant_Healthy: 'Lưỡi hổ không ghi nhận dấu hiệu bệnh rõ rệt, lá nhìn chung còn khỏe và ổn định.',
  Snake_Plant_Leaf_Withering: 'Lưỡi hổ có hiện tượng héo lá, đầu hoặc mép lá khô yếu dần do stress, thiếu chăm sóc phù hợp hoặc tác nhân bệnh.',
  Spider_Plant_Fungal_leaf_spot: 'Lan chi có dấu hiệu đốm lá do nấm, thường xuất hiện các vết nhỏ sẫm màu rồi lan rộng trên lá.',
  Spider_Plant_Healthy: 'Lan chi không ghi nhận dấu hiệu bệnh rõ rệt, lá hiện ở trạng thái tương đối khỏe mạnh.',
  Spider_Plant_Leaf_Tip_Necrosis: 'Lan chi bị hoại tử đầu lá, phần chóp lá khô nâu dần, thường liên quan đến stress môi trường hoặc mất cân bằng dinh dưỡng.',
};

/**
 * Chẩn đoán bệnh cây bằng AI từ ảnh.
 * @param {Buffer} imageBuffer - Buffer của ảnh upload
 * @param {string} filename - Tên file ảnh
 * @param {string} mimeType - MIME type của ảnh
 * @returns {Promise<{classId: number, label: string, confidence: number}>}
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
      description: DISEASE_DESCRIPTIONS[label] || null,
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
  generateText,
  diagnoseFromImage,
};
