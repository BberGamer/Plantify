// myGardenInsights.controller.js
// Tiếp nhận request dashboard My Garden, gọi service tổng hợp và trả response.

const apiResponse = require('../../utils/apiResponse');
const insightsService = require('./myGardenInsights.service');

/** Lấy dashboard My Garden của người dùng hiện tại. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getDashboard(req, res, next) {
  try {
    const dashboard = await insightsService.getMyGardenDashboard(req.user.id);
    return apiResponse.success(
      res,
      'Lấy dashboard My Garden thành công',
      dashboard
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
};
