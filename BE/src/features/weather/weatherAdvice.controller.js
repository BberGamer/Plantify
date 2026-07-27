const apiResponse = require('../../utils/apiResponse');
const weatherAdviceService = require('./weatherAdvice.service');

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
