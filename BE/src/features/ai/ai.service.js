// ai.service.js - Xử lý business logic liên quan đến AI (chat, chẩn đoán bệnh cây)
const axios = require('axios');
const { createAIProvider } = require('../../lib/ai/aiFactory');

// === AI Chat (Groq provider) ===

/**
 * Gọi Groq AI generate text với provider được cấu hình trong AI_PROVIDER
 * @param {string} prompt - Prompt cần xử lý
 * @param {object} options - Options optional (systemPrompt, temperature)
 * @returns {Promise<{text: string, model: string, provider: string}>}
 */
async function generateText(prompt, options = {}) {
  const providerName = process.env.AI_PROVIDER || 'groq';
  const provider = createAIProvider();

  console.log(`[AI Service] Provider: ${providerName} | Model: ${provider.modelName}`);

  const result = await provider.generateText(prompt, options);

  return {
    ...result,
    provider: providerName,
  };
}

// === AI Diagnosis (Groq Llama-4 Scout vision) ===

const GROQ_DIAGNOSIS_MODEL = 'qwen/qwen3.6-27b';
const GROQ_DIAGNOSIS_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DIAGNOSIS_PROMPT = `Bạn là chuyên gia bệnh cây cảnh. Hãy phân tích ảnh lá/cây được gửi kèm và trả lời CHỈ bằng JSON hợp lệ, không markdown.
Schema:
{
  "label": "Tên bệnh hoặc tình trạng chính bằng tiếng Việt",
  "confidence": 0.82,
  "description": "Mô tả ngắn gọn dấu hiệu nhìn thấy và nguyên nhân có thể",
  "treatment": ["Việc nên làm 1", "Việc nên làm 2", "Việc nên làm 3"],
  "solutionProposal": {
    "steps": ["Bước xử lý cụ thể 1", "Bước xử lý cụ thể 2", "Bước xử lý cụ thể 3"],
    "notes": ["Lưu ý quan trọng khi thực hiện", "Những điều cần tránh"],
    "timeline": "Thời gian theo dõi và phục hồi dự kiến",
    "prevention": "Cách phòng ngừa tái phát"
  }
}
Quy tắc:
- confidence là số từ 0 đến 1, thể hiện mức tự tin ước lượng từ ảnh.
- Nếu ảnh không rõ hoặc không phải cây, label phải là "Không đủ dữ liệu", confidence thấp, description giải thích lý do.
- Không khẳng định tuyệt đối; ưu tiên lời khuyên chăm sóc an toàn cho cây cảnh.
- solutionProposal cần chi tiết, thực tế, có thể áp dụng ngay.`;

function extractJsonObject(text) {
  const normalizedText = text?.trim();

  if (!normalizedText) {
    throw new Error('Groq khong tra ve noi dung chan doan.');
  }

  const jsonMatch = normalizedText.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : normalizedText;

  return JSON.parse(jsonText);
}

function normalizeConfidence(confidence) {
  const numberValue = Number(confidence);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  if (numberValue > 1) {
    return Math.max(0, Math.min(numberValue / 100, 1));
  }

  return Math.max(0, Math.min(numberValue, 1));
}

/**
 * Chẩn đoán bệnh cây bằng Groq Llama-4 Scout vision từ ảnh base64.
 * Mở rộng với solutionProposal chi tiết: steps, notes, timeline, prevention.
* @param {Buffer} imageBuffer - Buffer của ảnh upload
 * @param {string} filename - Tên file ảnh
 * @param {string} mimeType - MIME type của ảnh
 * @returns {Promise<{classId: null, label: string, confidence: number, description: string, treatment: string[], solutionProposal: object, model: string}>}
 */
async function diagnoseFromImage(imageBuffer, filename, mimeType) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const error = new Error('Chua cau hinh GROQ_API_KEY');
    error.statusCode = 500;
    throw error;
  }

  const contentType = mimeType || 'image/jpeg';
  const base64Image = imageBuffer.toString('base64');
  const imageUrl = `data:${contentType};base64,${base64Image}`;

  try {
    console.log('=================================');
    console.log('[Groq Vision Diagnosis] Calling API...');
    console.log('Model:', GROQ_DIAGNOSIS_MODEL);
    console.log('File:', filename || 'image.jpg');

    const response = await axios.post(
      GROQ_DIAGNOSIS_API_URL,
      {
        model: GROQ_DIAGNOSIS_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: DIAGNOSIS_PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );

    const rawText = response.data.choices[0]?.message?.content;
    const parsedResult = extractJsonObject(rawText);

    console.log('[Groq Vision Diagnosis] Success');
    console.log('=================================');

    return {
      classId: null,
      label: parsedResult.label || 'Không đủ dữ liệu',
      confidence: normalizeConfidence(parsedResult.confidence),
      description: parsedResult.description || '',
      treatment: Array.isArray(parsedResult.treatment) ? parsedResult.treatment : [],
      solutionProposal: parsedResult.solutionProposal || null,
      model: GROQ_DIAGNOSIS_MODEL,
    };
  } catch (error) {
    console.error('=================================');
    console.error('[Groq Vision Diagnosis] Error:', error?.response?.data || error.message);
    console.error('=================================');

    if (error?.response?.status === 401) {
      const err = new Error('GROQ_API_KEY không hợp lệ.');
      err.statusCode = 401;
      throw err;
    }

    if (error?.response?.status === 429) {
      const err = new Error('Da vuot qua gioi han request Groq. Vui long thu lai sau.');
      err.statusCode = 429;
      throw err;
    }

    if (error?.response?.status === 400) {
      const err = new Error('File anh khong hop le hoac Groq khong the xu ly anh nay.');
      err.statusCode = 400;
      throw err;
    }
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      const err = new Error('Yeu cau chan doan het thoi gian. Vui long thu lai.');
      err.statusCode = 504;
      throw err;
    }

    if (error instanceof SyntaxError) {
      const err = new Error('Groq tra ve ket qua khong dung dinh dang JSON.');
      err.statusCode = 502;
      throw err;
    }

    const err = new Error('Chan doan bang Groq that bai.');
    err.statusCode = 500;
    throw err;
  }
}

module.exports = {
  generateText,
  diagnoseFromImage,
};