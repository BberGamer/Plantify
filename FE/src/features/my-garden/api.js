// api.js - Gọi các API CRUD My Garden của user đang đăng nhập
import { api } from "@/lib/api";

const MY_GARDEN_API = "/my-garden";

export async function createUserPlant(payload) {
  const response = await api.post(MY_GARDEN_API, payload);
  return response.data;
}

export async function getMyGarden(signal) {
  const response = await api.get(MY_GARDEN_API, { signal });
  return response.data;
}

export async function getUserPlantById(userPlantId, signal) {
  const response = await api.get(`${MY_GARDEN_API}/${userPlantId}`, { signal });
  return response.data;
}

export async function updateUserPlant(userPlantId, payload) {
  const response = await api.patch(`${MY_GARDEN_API}/${userPlantId}`, payload);
  return response.data;
}

export async function deleteUserPlant(userPlantId) {
  const response = await api.delete(`${MY_GARDEN_API}/${userPlantId}`);
  return response.data;
}
