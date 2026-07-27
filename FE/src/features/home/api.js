// api.js - Gọi API thời tiết phục vụ nội dung trang chủ
import { api } from "@/lib/api";

/**
 * Lấy thông tin thời tiết theo tên thành phố
 * @param {string} city - Tên thành phố
 * @returns {Promise<object>}
 */
export async function getWeatherByCity(city) {
  const response = await api.get("/weather", {
    params: { city },
    skipAuth: true,
    skipAuthExpiry: true,
  });
  return response.data.data;
}
