// weatherAdvice.controller.js
// Tiếp nhận request khuyến nghị thời tiết cho My Garden và trả response thống nhất.

const apiResponse = require('../../utils/apiResponse');
const weatherAdviceService = require('./weatherAdvice.service');

/** Lấy khuyến nghị chăm sóc theo thời tiết cho My Garden. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getMyGardenWeatherAdvice(req, res, next) {
  try {
    const data = await weatherAdviceService.getMyGardenWeatherAdvice(
      req.user.id,
      req.query.city
    );
    return apiResponse.success(res, 'Lấy khuyến nghị chăm cây theo thời tiết thành công', data);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getMyGardenWeatherAdvice };
