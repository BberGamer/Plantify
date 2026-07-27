// weather.service.js - Business logic for OpenWeatherMap current weather API

const DEFAULT_OPENWEATHER_BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_ICON_BASE_URL = 'https://openweathermap.org/img/wn';

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getWeatherByCity(city) {
  const normalizedCity = city?.trim();

  if (!normalizedCity) {
    throw createHttpError('Vui lòng nhập tên thành phố', 400);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw createHttpError('Chưa cấu hình OPENWEATHER_API_KEY', 500);
  }

  const params = new URLSearchParams({
    q: normalizedCity,
    appid: apiKey,
    units: 'metric',
    lang: 'vi',
  });

  const configuredBaseUrl = process.env.OPENWEATHER_BASE_URL || DEFAULT_OPENWEATHER_BASE_URL;
  const baseUrl = configuredBaseUrl.replace(/\/$/, '');
  const endpoint = baseUrl.endsWith('/weather') ? baseUrl : `${baseUrl}/weather`;
  const response = await fetch(`${endpoint}?${params.toString()}`);
  const data = await response.json();

  if (data.cod === '404' || data.cod === 404) {
    throw createHttpError('Không tìm thấy thông tin thời tiết cho thành phố này', 404);
  }

  if (response.status === 401) {
    throw createHttpError('OPENWEATHER_API_KEY không hợp lệ hoặc đã hết hạn', 502);
  }

  if (!response.ok) {
    throw createHttpError(data.message || 'Không thể lấy thông tin thời tiết', response.status);
  }

  const main = data.main || {};
  const wind = data.wind || {};
  const rain = data.rain || {};
  const clouds = data.clouds || {};
  const weather = data.weather?.[0] || {};

  return {
    cityName: data.name,
    country: data.sys?.country,
    temperature: main.temp,
    pressure: main.pressure,
    humidity: main.humidity,
    windSpeed: wind.speed,
    rainLastHourMm: Number(rain['1h'] || 0),
    rainLastThreeHoursMm: Number(rain['3h'] || 0),
    cloudiness: clouds.all,
    conditionCode: weather.id,
    description: weather.description,
    icon: weather.icon,
    iconUrl: weather.icon ? `${OPENWEATHER_ICON_BASE_URL}/${weather.icon}.png` : null,
  };
}

module.exports = {
  getWeatherByCity,
};
