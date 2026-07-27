const apiResponse = require('../../utils/apiResponse');
const insightsService = require('./myGardenInsights.service');

async function getTimeline(req, res, next) {
  try {
    const timeline = await insightsService.getMyUserPlantTimeline(
      req.user.id,
      req.params.id,
      req.query
    );
    if (!timeline) {
      return apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden');
    }
    return apiResponse.success(
      res,
      'Lấy timeline cây thành công',
      timeline
    );
  } catch (error) {
    return next(error);
  }
}

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
  getTimeline,
  getDashboard,
};
