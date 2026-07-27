// api.js - Gọi API dữ liệu thời tiết theo vị trí
import { api } from "@/lib/api";

export const getWeatherByCity = async (city) => {
  const response = await api.get("/weather", {
    params: { city },
    skipAuth: true,
    skipAuthExpiry: true,
  });
  return response.data;
};
