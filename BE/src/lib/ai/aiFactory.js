// aiFactory.js - Factory để chọn AI Provider dựa trên config

const { AIProvider } = require('./aiProvider.interface');
const { GeminiProvider } = require('./providers/gemini.provider');
const { GroqProvider } = require('./providers/groq.provider');

const PROVIDERS = {
  gemini: GeminiProvider,
  groq: GroqProvider,
};

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Tạo AI Provider instance dựa trên process.env.AI_PROVIDER
 * @returns {AIProvider}
 */
function createAIProvider() {
  const providerName = process.env.AI_PROVIDER || 'gemini';
  const ProviderClass = PROVIDERS[providerName];

  if (!ProviderClass) {
    throw createHttpError(
      `AI Provider "${providerName}" không được hỗ trợ. Các provider khả dụng: ${Object.keys(PROVIDERS).join(', ')}`,
      500
    );
  }

  const provider = new ProviderClass();
  provider.validateConfig();

  return provider;
}

module.exports = { createAIProvider };
