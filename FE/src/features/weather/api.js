// api.js - Gọi API dữ liệu thời tiết theo vị trí
import { api } from "@/lib/api";

/** Lấy dữ liệu thời tiết theo tên thành phố. @param {string} city - Thành phố cần tra cứu. @returns {Promise<Object>} Dữ liệu thời tiết. */
export const getWeatherByCity = async (city) => {
  const response = await api.get("/weather", {
    params: { city },
    skipAuth: true,
    skipAuthExpiry: true,
  });
  return response.data;
};
