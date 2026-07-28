// ai.service.js - Xử lý chẩn đoán bệnh cây bằng AI
const { OpenRouterDiagnosisProvider } = require('../../lib/ai/providers/openrouter.diagnosis.provider');

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
  diagnoseFromImage,
};
