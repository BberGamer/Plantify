// gemini.provider.js - Gemini AI Provider implementation

const { AIProvider } = require('../aiProvider.interface');
const { GoogleGenAI } = require('@google/genai');

class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  validateConfig() {
    if (!this.apiKey) {
      const error = new Error('Chua cau hinh GEMINI_API_KEY');
      error.statusCode = 500;
      throw error;
    }
  }

  getClient() {
    return new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generateText(prompt) {
    const normalizedPrompt = prompt?.trim();

    if (!normalizedPrompt) {
      const error = new Error('Vui long nhap prompt');
      error.statusCode = 400;
      throw error;
    }

    const ai = this.getClient();

    try {
      console.log('=================================');
      console.log('Calling Gemini...');
      console.log('Model:', this.modelName);
      console.log('Prompt:', normalizedPrompt);

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: normalizedPrompt,
      });

      console.log('Gemini Success');
      console.log('=================================');

      return {
        text: response.text,
        model: this.modelName,
      };
    } catch (error) {
      console.error('=================================');
      console.error('Gemini Error:', error);
      console.error('=================================');

      if (
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('429')
      ) {
        const err = new Error('Da vuot qua gioi han Gemini Free Tier. Vui long thu lai sau.');
        err.statusCode = 429;
        throw err;
      }

      if (
        error?.message?.includes('UNAVAILABLE') ||
        error?.message?.includes('503')
      ) {
        const err = new Error('Gemini dang qua tai. Vui long thu lai sau it phut.');
        err.statusCode = 503;
        throw err;
      }

      const err = new Error('AI service tam thoi khong kha dung.');
      err.statusCode = 500;
      throw err;
    }
  }
}

module.exports = { GeminiProvider };
