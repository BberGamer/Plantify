// groq.provider.js - Groq AI Provider implementation
// Sử dụng OpenAI-compatible API endpoint của Groq
// Model mặc định: openai/gpt-oss-120b (có thể đổi qua GROQ_MODEL env)

const { AIProvider } = require('../aiProvider.interface');
const axios = require('axios');

// System prompt hướng dẫn AI trả lời gọn gàng, chuyên nghiệp
const SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn cây cảnh. Trả lời bằng tiếng Việt.
- Ưu tiên dùng bullet points (•) cho danh sách, KHÔNG dùng bảng
- Dùng tiêu đề ## cho mỗi đầu mục chính
- Ngắn gọn, có điểm, dễ đọc
- Không format dạng bảng (|---|) hay markdown table`;

class GroqProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.GROQ_API_KEY;
    this.modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  validateConfig() {
    if (!this.apiKey) {
      const error = new Error('Chua cau hinh GROQ_API_KEY');
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Gọi Groq API để generate text (OpenAI-compatible)
   * @param {string} prompt - Prompt từ user
   * @returns {Promise<{text: string, model: string}>}
   */
  async generateText(prompt) {
    const normalizedPrompt = prompt?.trim();

    if (!normalizedPrompt) {
      const error = new Error('Vui long nhap prompt');
      error.statusCode = 400;
      throw error;
    }

    try {
      console.log('=================================');
      console.log('[Groq Provider] Calling API...');
      console.log('Model:', this.modelName);
      console.log('Prompt:', normalizedPrompt);

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.modelName,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: normalizedPrompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.choices[0]?.message?.content;

      console.log('[Groq Provider] Success');
      console.log('=================================');

      return {
        text: text || '',
        model: this.modelName,
      };
    } catch (error) {
      console.error('=================================');
      console.error('[Groq Provider] Error:', error?.response?.data || error.message);
      console.error('=================================');

      if (error?.response?.status === 401) {
        const err = new Error('GROQ API key không hợp lệ.');
        err.statusCode = 401;
        throw err;
      }

      if (error?.response?.status === 429) {
        const err = new Error('Da vuot qua gioi han request Groq. Vui long thu lai sau.');
        err.statusCode = 429;
        throw err;
      }

      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        const err = new Error('Groq request bi timeout. Vui long thu lai.');
        err.statusCode = 504;
        throw err;
      }

      const err = new Error('AI service tam thoi khong kha dung.');
      err.statusCode = 500;
      throw err;
    }
  }
}

module.exports = { GroqProvider };
