const apiResponse = require('../../utils/apiResponse');
const insightsService = require('./myGardenInsights.service');

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
