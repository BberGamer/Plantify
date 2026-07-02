// ai.service.js - Xử lý business logic liên quan đến AI (chat, chẩn đoán bệnh cây)
const OpenAI = require('openai');
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

// === AI Diagnosis (OpenAI vision) ===

const OPENAI_DIAGNOSIS_MODEL = process.env.OPENAI_DIAGNOSIS_MODEL || 'gpt-5-mini';
const DIAGNOSIS_PROMPT = `Bạn là chuyên gia bệnh cây cảnh. Hãy phân tích ảnh lá/cây được gửi kèm và trả lời CHỈ bằng JSON hợp lệ, không markdown.
Schema:
{
  "label": "Tên bệnh hoặc tình trạng chính bằng tiếng Việt",
  "confidence": 0.82,
  "description": "Mô tả ngắn gọn dấu hiệu nhìn thấy và nguyên nhân có thể",
  "treatment": ["Việc nên làm 1", "Việc nên làm 2", "Việc nên làm 3"]
}
Quy tắc:
- confidence là số từ 0 đến 1, thể hiện mức tự tin ước lượng từ ảnh.
- Nếu ảnh không rõ hoặc không phải cây, label phải là "Không đủ dữ liệu", confidence thấp, description giải thích lý do.
- Không khẳng định tuyệt đối; ưu tiên lời khuyên chăm sóc an toàn cho cây cảnh.`;

function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('Chua cau hinh OPENAI_API_KEY');
    error.statusCode = 500;
    throw error;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function extractJsonObject(text) {
  const normalizedText = text?.trim();

  if (!normalizedText) {
    throw new Error('OpenAI khong tra ve noi dung chan doan.');
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
 * Chẩn đoán bệnh cây bằng OpenAI vision từ ảnh.
 * @param {Buffer} imageBuffer - Buffer của ảnh upload
 * @param {string} filename - Tên file ảnh
 * @param {string} mimeType - MIME type của ảnh
 * @returns {Promise<{classId: null, label: string, confidence: number, description: string, treatment: string[], model: string}>}
 */
async function diagnoseFromImage(imageBuffer, filename, mimeType) {
  const client = createOpenAIClient();
  const contentType = mimeType || 'image/jpeg';
  const base64Image = imageBuffer.toString('base64');
  const imageUrl = `data:${contentType};base64,${base64Image}`;

  try {
    console.log('=================================');
    console.log('[OpenAI Diagnosis] Calling API...');
    console.log('Model:', OPENAI_DIAGNOSIS_MODEL);
    console.log('File:', filename || 'image.jpg');

    const result = await client.responses.create({
      model: OPENAI_DIAGNOSIS_MODEL,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: DIAGNOSIS_PROMPT },
            { type: 'input_image', image_url: imageUrl },
          ],
        },
      ],
      max_output_tokens: 700,
    });

    const parsedResult = extractJsonObject(result.output_text);

    console.log('[OpenAI Diagnosis] Success');
    console.log('=================================');

    return {
      classId: null,
      label: parsedResult.label || 'Không đủ dữ liệu',
      confidence: normalizeConfidence(parsedResult.confidence),
      description: parsedResult.description || '',
      treatment: Array.isArray(parsedResult.treatment) ? parsedResult.treatment : [],
      model: OPENAI_DIAGNOSIS_MODEL,
    };
  } catch (error) {
    console.error('=================================');
    console.error('[OpenAI Diagnosis] Error:', error?.response?.data || error.message);
    console.error('=================================');

    if (error.status === 401) {
      const err = new Error('OPENAI_API_KEY không hợp lệ.');
      err.statusCode = 401;
      throw err;
    }

    if (error.status === 429) {
      const err = new Error('Đã vượt quá giới hạn OpenAI. Vui lòng thử lại sau.');
      err.statusCode = 429;
      throw err;
    }

    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      const err = new Error('Yêu cầu chẩn đoán hết thời gian. Vui lòng thử lại.');
      err.statusCode = 504;
      throw err;
    }

    if (error instanceof SyntaxError) {
      const err = new Error('OpenAI trả về kết quả không đúng định dạng JSON.');
      err.statusCode = 502;
      throw err;
    }

    if (error.status === 400) {
      const err = new Error('File ảnh không hợp lệ hoặc OpenAI không thể xử lý ảnh này.');
      err.statusCode = 400;
      throw err;
    }

    const err = new Error('Chẩn đoán bằng OpenAI thất bại.');
    err.statusCode = 500;
    throw err;
  }
}

module.exports = {
  generateText,
  diagnoseFromImage,
};
