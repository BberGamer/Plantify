const aiService = require('./ai.service');
const apiResponse = require('../../utils/apiResponse');

async function generateText(req, res, next) {
  try {
    const result = await aiService.generateText(req.body.prompt);
    return apiResponse.success(res, 'Goi Gemini thanh cong', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateText,
};
