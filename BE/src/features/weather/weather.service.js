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
    throw createHttpError('Vui long nhap ten thanh pho', 400);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw createHttpError('Chua cau hinh OPENWEATHER_API_KEY', 500);
  }

  const params = new URLSearchParams({
    q: normalizedCity,
    appid: apiKey,
    units: 'metric',
    lang: 'vi',
  });

  const baseUrl = process.env.OPENWEATHER_BASE_URL || DEFAULT_OPENWEATHER_BASE_URL;
  const response = await fetch(`${baseUrl}?${params.toString()}`);
  const data = await response.json();

  if (data.cod === '404' || data.cod === 404) {
    throw createHttpError('Khong tim thay thong tin thoi tiet cho thanh pho nay', 404);
  }

  if (response.status === 401) {
    throw createHttpError('OPENWEATHER_API_KEY khong hop le hoac da het han', 502);
  }

  if (!response.ok) {
    throw createHttpError(data.message || 'Khong the lay thong tin thoi tiet', response.status);
  }

  const main = data.main || {};
  const wind = data.wind || {};
  const weather = data.weather?.[0] || {};

  return {
    cityName: data.name,
    country: data.sys?.country,
    temperature: main.temp,
    pressure: main.pressure,
    humidity: main.humidity,
    windSpeed: wind.speed,
    description: weather.description,
    icon: weather.icon,
    iconUrl: weather.icon ? `${OPENWEATHER_ICON_BASE_URL}/${weather.icon}.png` : null,
  };
}

module.exports = {
  getWeatherByCity,
};
