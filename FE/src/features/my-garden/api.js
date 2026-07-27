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

export async function getMyGardenDashboard(signal) {
  const response = await api.get(`${MY_GARDEN_API}/dashboard`, { signal });
  return response.data;
}

export async function getMyGardenWeatherAdvice(city, signal) {
  const response = await api.get(`${MY_GARDEN_API}/weather-advice`, {
    params: { city },
    signal,
  });
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

export async function uploadUserPlantImage(userPlantId, formData, onUploadProgress) {
  const response = await api.post(`${MY_GARDEN_API}/${userPlantId}/images`, formData, {
    onUploadProgress,
  });
  return response.data;
}

export async function updateUserPlantImage(userPlantId, imageId, payload) {
  const response = await api.patch(`${MY_GARDEN_API}/${userPlantId}/images/${imageId}`, payload);
  return response.data;
}

export async function deleteUserPlantImage(userPlantId, imageId) {
  const response = await api.delete(`${MY_GARDEN_API}/${userPlantId}/images/${imageId}`);
  return response.data;
}

export async function getCareEvents(userPlantId) { const response = await api.get(`${MY_GARDEN_API}/${userPlantId}/care-events`); return response.data; }
export async function createCareEvent(userPlantId, payload) { const response = await api.post(`${MY_GARDEN_API}/${userPlantId}/care-events`, payload); return response.data; }
export async function deleteCareEvent(userPlantId, eventId) { const response = await api.delete(`${MY_GARDEN_API}/${userPlantId}/care-events/${eventId}`); return response.data; }
