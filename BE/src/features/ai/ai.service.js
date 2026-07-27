// ai.service.js - Xử lý business logic liên quan đến AI (chat, chẩn đoán bệnh cây)
const { createAIProvider } = require('../../lib/ai/aiFactory');
const { OpenRouterDiagnosisProvider } = require('../../lib/ai/providers/openrouter.diagnosis.provider');

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

// === AI Diagnosis (OpenRouter Vision) ===

/**
 * Chẩn đoán bệnh cây bằng OpenRouter Vision từ Buffer ảnh.
 * Provider chỉ trả contract chẩn đoán; treatment/product do knowledge base quyết định.
 * @param {Buffer} imageBuffer - Buffer của ảnh upload
 * @param {string} filename - Tên file ảnh
 * @param {string} mimeType - MIME type của ảnh
 * @returns {Promise<{
 *   suspectedCondition: string,
 *   category: string,
 *   confidence: number,
 *   observedSymptoms: string[],
 *   severity: string,
 *   affectedPart: string,
 *   description: string,
 *   model: string,
 *   provider: 'openrouter'
 * }>}
 */
async function diagnoseFromImage(imageBuffer, filename, mimeType) {
  const provider = new OpenRouterDiagnosisProvider();
  provider.validateConfig();
  return provider.diagnoseFromImage(imageBuffer, filename, mimeType);
}

module.exports = {
  generateText,
  diagnoseFromImage,
};
