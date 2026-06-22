// weather.controller.js - Handle request/response for weather API
const weatherService = require('./weather.service');
const apiResponse = require('../../utils/apiResponse');

async function getWeather(req, res, next) {
  try {
    const weather = await weatherService.getWeatherByCity(req.query.city);
    return apiResponse.success(res, 'Lay thong tin thoi tiet thanh cong', weather);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWeather,
};
