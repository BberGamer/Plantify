const { GoogleGenAI } = require('@google/genai');

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw createHttpError('Chua cau hinh GEMINI_API_KEY', 500);
  }

  return new GoogleGenAI({ apiKey });
}

async function generateText(prompt) {
  const normalizedPrompt = prompt?.trim();

  if (!normalizedPrompt) {
    throw createHttpError('Vui long nhap prompt', 400);
  }

  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    console.log('=================================');
    console.log('Calling Gemini...');
    console.log('Model:', modelName);
    console.log('Prompt:', normalizedPrompt);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: normalizedPrompt,
    });

    console.log('Gemini Success');
    console.log('=================================');

    return {
      text: response.text,
      model: modelName,
    };
  } catch (error) {
    console.error('=================================');
    console.error('Gemini Error:', error);
    console.error('=================================');

    // Hết quota
    if (
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.message?.includes('429')
    ) {
      throw createHttpError(
        'Da vuot qua gioi han Gemini Free Tier. Vui long thu lai sau.',
        429
      );
    }

    // Model quá tải
    if (
      error?.message?.includes('UNAVAILABLE') ||
      error?.message?.includes('503')
    ) {
      throw createHttpError(
        'Gemini dang qua tai. Vui long thu lai sau it phut.',
        503
      );
    }

    throw createHttpError(
      'AI service tam thoi khong kha dung.',
      500
    );
  }
}

module.exports = {
  generateText,
};