/**
 * useWeather.js - Hook quản lý state thời tiết
 * @returns {object} Weather state và các hàm xử lý
 */
import { useState, useEffect, useCallback } from "react";
import { getWeatherByCity } from "../api";

export function useWeather() {
  const [weatherCity, setWeatherCity] = useState("Ho Chi Minh");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const fetchWeather = useCallback(async (city) => {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setWeatherError("Vui lòng nhập tên thành phố");
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    try {
      const data = await getWeatherByCity(trimmedCity);
      setWeather(data);
    } catch (error) {
      setWeather(null);
      setWeatherError(
        error.response?.data?.message
          || error.message
          || "Không thể tải thông tin thời tiết"
      );
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const handleWeatherSearch = useCallback(
    (event) => {
      event.preventDefault();
      fetchWeather(weatherCity);
    },
    [weatherCity, fetchWeather]
  );

  useEffect(() => {
    fetchWeather("Ho Chi Minh");
  }, [fetchWeather]);

  return {
    weatherCity,
    setWeatherCity,
    weather,
    weatherLoading,
    weatherError,
    handleWeatherSearch,
  };
}
