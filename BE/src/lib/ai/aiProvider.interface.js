// aiProvider.interface.js - Định nghĩa contract cho AI Provider

/**
 * Interface/base class cho AI Provider
 * Implement các provider cụ thể như Gemini, Groq kế thừa class này
 */
class AIProvider {
  /**
   * Generate text từ prompt
   * @param {string} prompt - Prompt cần xử lý
   * @returns {Promise<{text: string, model: string}>}
   */
  async generateText(prompt) {
    throw new Error('Method generateText() must be implemented');
  }

  /**
   * Validate provider configuration
   * @returns {void}
   * @throws {Error} Nếu thiếu config cần thiết
   */
  validateConfig() {
    throw new Error('Method validateConfig() must be implemented');
  }
}

module.exports = { AIProvider };
