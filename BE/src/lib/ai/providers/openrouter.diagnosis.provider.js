// openrouter.diagnosis.provider.js - OpenRouter Vision Provider cho Plant Disease Diagnosis
// Model mặc định: openai/gpt-4o (có thể đổi qua OPENROUTER_MODEL env)

const { AIProvider } = require('../aiProvider.interface');
const axios = require('axios');

// Prompt chỉ yêu cầu các field quan sát/chẩn đoán. Điều trị và sản phẩm
// được quyết định bởi PlantDisease knowledge base, không lấy từ AI.
const DIAGNOSIS_PROMPT = `Bạn là chuyên gia bệnh cây cảnh. Phân tích ảnh lá/cây và trả lời CHỈ bằng JSON hợp lệ, không markdown, không giải thích ngoài JSON.
Schema:
{
  "suspectedCondition": "Tên tình trạng nghi ngờ bằng tiếng Việt",
  "category": "Disease | Pest | Nutrient | Environment | Healthy | Unknown",
  "observedSymptoms": ["Dấu hiệu thực sự quan sát thấy 1", "Dấu hiệu thực sự quan sát thấy 2"],
  "confidence": 0.82,
  "severity": "Low | Medium | High | Unknown",
  "affectedPart": "Leaf | Stem | Root | Flower | Whole_Plant | Unknown",
  "description": "Mô tả ngắn dấu hiệu nhìn thấy và nguyên nhân có thể"
}

Quy trình:
1. Quan sát ảnh: màu sắc, hình dạng, vị trí, có/không côn trùng, có/không vết bệnh. Chỉ mô tả thứ thực sự nhìn thấy.
2. Chọn ĐÚNG MỘT category:
   - Disease: triệu chứng nấm/vi khuẩn/virus (đốm, thối, phấn trắng, héo, sọc vàng).
   - Pest: có sinh vật gây hại hoặc dấu vết (côn trùng, nhện, sâu, ấu trùng, trứng).
   - Nutrient: thiếu/thừa dinh dưỡng, không có dấu hiệu bệnh hay sinh vật rõ ràng.
   - Environment: stress môi trường/sinh lý (thiếu nước, thừa nắng, úng, sốc nhiệt).
   - Healthy: cây khỏe mạnh, không thấy dấu hiệu bệnh, sâu hại hay stress.
   - Unknown: ảnh không rõ, không phải cây, hoặc không đủ dữ liệu.
3. Gán suspectedCondition, observedSymptoms, severity và affectedPart sau khi đã chốt category.

Quy tắc cốt lõi:
- Thấy côn trùng/nhện/sâu/ấu trùng/trứng → ưu tiên Pest. Chỉ xếp Disease khi có bằng chứng rõ cả hai cùng tồn tại.
- Không bịa triệu chứng không nhìn thấy.
- Chỉ dùng thông tin quan sát được từ ảnh. Thiếu thông tin cần thiết thì ghi rõ trong description và giảm confidence.
- Bằng chứng không đủ → suspectedCondition "Không đủ dữ liệu", category "Unknown", confidence thấp.
- Không tạo diseaseKey hoặc mã bệnh. Backend sẽ quyết định canonical disease.
- Không dùng tiếng Anh trong suspectedCondition, observedSymptoms hoặc description.
- Không thêm bất kỳ field nào ngoài đúng 7 field trong schema.

Confidence và đầu ra:
- Rõ, triệu chứng điển hình: 0.70–0.95.
- Trung bình, một phần khớp: 0.50–0.69.
- Yếu hoặc mơ hồ: 0.20–0.49.
- Không đủ dữ liệu hoặc không phải cây: ≤0.20.`;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/jpg', 'image/webp']);
const CATEGORIES = new Set([
  'disease',
  'pest',
  'nutrient',
  'environment',
  'healthy',
  'unknown',
]);
const SEVERITIES = new Set(['low', 'medium', 'high', 'unknown']);
const AFFECTED_PARTS = new Set([
  'leaf',
  'stem',
  'root',
  'flower',
  'whole_plant',
  'unknown',
]);

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function extractJsonObject(text) {
  const normalizedText = text && text.trim();

  if (!normalizedText) {
    throw new Error('OpenRouter không trả về nội dung chẩn đoán.');
  }

  const firstBrace = normalizedText.indexOf('{');
  if (firstBrace === -1) {
    throw new Error('OpenRouter response không chứa JSON object.');
  }

  let depth = 0;
  let inString = false;
  let escape = false;
  let lastIndex = -1;

  for (let i = firstBrace; i < normalizedText.length; i += 1) {
    const ch = normalizedText[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) { lastIndex = i; break; }
    }
  }

  if (lastIndex === -1) {
    throw new Error('OpenRouter trả về JSON không đầy đủ (brace không khớp).');
  }

  return JSON.parse(normalizedText.slice(firstBrace, lastIndex + 1));
}

function normalizeConfidence(confidence) {
  const numberValue = Number(confidence);
  if (!Number.isFinite(numberValue)) return 0;
  if (numberValue > 1) return Math.max(0, Math.min(numberValue / 100, 1));
  return Math.max(0, Math.min(numberValue, 1));
}

function normalizeEnum(value, allowedValues, fallback = 'unknown') {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return allowedValues.has(normalizedValue) ? normalizedValue : fallback;
}

function normalizeDiagnosisResult(parsedResult = {}) {
  const suspectedCondition = typeof parsedResult.suspectedCondition === 'string'
    ? parsedResult.suspectedCondition.trim()
    : '';
  const category = normalizeEnum(parsedResult.category, CATEGORIES);
  const observedSymptoms = Array.isArray(parsedResult.observedSymptoms)
    ? parsedResult.observedSymptoms
      .filter((symptom) => typeof symptom === 'string')
      .map((symptom) => symptom.trim())
      .filter(Boolean)
    : [];

  return {
    suspectedCondition: suspectedCondition
      || (category === 'healthy' ? 'Cây khỏe mạnh' : 'Không đủ dữ liệu'),
    category,
    observedSymptoms,
    confidence: normalizeConfidence(parsedResult.confidence),
    severity: normalizeEnum(parsedResult.severity, SEVERITIES),
    affectedPart: normalizeEnum(parsedResult.affectedPart, AFFECTED_PARTS),
    description: typeof parsedResult.description === 'string'
      ? parsedResult.description.trim()
      : '',
  };
}

class OpenRouterDiagnosisProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.modelName = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';
    this.baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.referer = 'http://localhost:3000';
    this.appTitle = 'Plantify AI Doctor';
  }

  validateConfig() {
    if (!this.apiKey) {
      throw createHttpError('Chưa cấu hình OPENROUTER_API_KEY', 500);
    }
  }

  /**
   * Chẩn đoán ảnh theo contract đã normalize, không chứa recommendation từ AI.
   * @returns {Promise<{
   *   suspectedCondition: string,
   *   category: 'disease'|'pest'|'nutrient'|'environment'|'healthy'|'unknown',
   *   confidence: number,
   *   observedSymptoms: string[],
   *   severity: 'low'|'medium'|'high'|'unknown',
   *   affectedPart: 'leaf'|'stem'|'root'|'flower'|'whole_plant'|'unknown',
   *   description: string,
   *   model: string,
   *   provider: 'openrouter'
   * }>}
   */
  async diagnoseFromImage(imageBuffer, filename, mimeType) {
    if (!imageBuffer || !imageBuffer.length) {
      throw createHttpError('Vui lòng upload ảnh lá cây để chẩn đoán.', 400);
    }
    const contentType = mimeType || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      throw createHttpError('Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng JPG, PNG, hoặc WebP.', 400);
    }
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = 'data:' + contentType + ';base64,' + base64Image;
    let rawText = '';

    try {
      console.log('=================================');
      console.log('[OpenRouter Vision Diagnosis] Calling API...');
      console.log('Model:', this.modelName);
      console.log('File:', filename || 'image.jpg');

      const response = await axios.post(
        this.baseURL + '/chat/completions',
        {
          model: this.modelName,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: DIAGNOSIS_PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }],
          max_tokens: 1500,
          temperature: 0
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.apiKey,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.referer,
            'X-Title': this.appTitle
          },
          timeout: 45000
        }
      );

      rawText = response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content;
      const parsedResult = extractJsonObject(rawText);
      const normalizedResult = normalizeDiagnosisResult(parsedResult);

      console.log('[OpenRouter Vision Diagnosis] Success');
      console.log('=================================');

      return {
        ...normalizedResult,
        model: this.modelName,
        provider: 'openrouter',
      };
    } catch (error) {
      console.error('=================================');
      console.error('[OpenRouter Vision Diagnosis] Error:', (error && error.response && error.response.data) || error.message);
      if (error instanceof SyntaxError) {
        console.error('[OpenRouter Vision Diagnosis] Raw content (truncated to 500 chars):');
        console.error(typeof rawText === 'string' ? rawText.slice(0, 500) : JSON.stringify(rawText));
      }
      console.error('=================================');

      if (error && error.response && error.response.status === 401) throw createHttpError('OPENROUTER_API_KEY không hợp lệ.', 401);
      if (error && error.response && error.response.status === 429) throw createHttpError('Đã vượt quota OpenRouter. Vui lòng thử lại sau.', 429);
      if (error && error.response && error.response.status === 404) throw createHttpError('Vision model không khả dụng. Kiểm tra OPENROUTER_MODEL.', 502);
      if (error && error.response && error.response.status === 400) throw createHttpError('File ảnh không hợp lệ hoặc OpenRouter không thể xử lý ảnh này.', 400);
      if (error && (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout')))) throw createHttpError('Yêu cầu chẩn đoán hết thời gian. Vui lòng thử lại.', 504);
      if (error && (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'EAI_AGAIN')) throw createHttpError('Không kết nối được OpenRouter. Vui lòng kiểm tra mạng.', 503);
      if (error instanceof SyntaxError) throw createHttpError('OpenRouter trả về kết quả không đúng định dạng JSON.', 502);
      throw createHttpError('Chẩn đoán bằng OpenRouter thất bại.', 500);
    }
  }

  async generateText() {
    throw createHttpError('OpenRouterDiagnosisProvider chỉ hỗ trợ diagnoseFromImage().', 500);
  }
}

module.exports = {
  OpenRouterDiagnosisProvider,
  normalizeDiagnosisResult,
};
