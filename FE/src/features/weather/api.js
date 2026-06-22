// api.js - Cac ham goi API lien quan toi thoi tiet.
import { api } from "@/lib/api";

export const getWeatherByCity = async (city) => {
  const response = await api.get("/weather", { params: { city } });
  return response.data;
};
