// aiProvider.interface.js - Định nghĩa contract cho AI Provider

/**
 * Interface/base class cho AI Provider
 * Các provider chẩn đoán cụ thể kế thừa class này.
 */
class AIProvider {
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
