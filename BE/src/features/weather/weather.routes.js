// weather.routes.js - Define route for OpenWeatherMap current weather API
const express = require('express');
const weatherController = require('./weather.controller');

const router = express.Router();

// GET /api/weather?city=Ho Chi Minh - Get current weather by city.
router.get('/', weatherController.getWeather);

module.exports = router;
