// src/services/plantService.js - Goi API Plants tu backend
import api from "./api";
import { adaptPlantsList, mapPlantsParams } from "./listAdapters";
import { Platform } from "react-native";
import { getSessionContext } from "./sessionAccess";

async function savePlant(method, url, plant, photo) {
  const sessionContext = getSessionContext();
  if (!photo) return (await api[method](url, plant, { sessionContext })).data;
  const body = new FormData();
  body.append("payload", JSON.stringify(plant));
  if (Platform.OS === "web") {
    const blob = await (await fetch(photo.uri)).blob();
    body.append("photo", blob, photo.fileName || "plant.jpg");
  } else {
    body.append("photo", { uri: photo.uri, name: photo.fileName || "plant.jpg", type: photo.mimeType || "image/jpeg" });
  }
  return (await api[method](url, body, { sessionContext,
    headers: { "Content-Type": Platform.OS === "web" ? false : "multipart/form-data" },
  })).data;
}

const plantService = {
  /**
   * Lay danh sach danh muc cay
   * GET /api/plants/categories
   */
  getCategories: async () => {
    const response = await api.get("/plants/categories");
    return response.data; // { success, message, data: [...] }
  },

  /**
   * Lay danh sach cay co the loc theo danh muc va tim kiem
   * GET /api/plants?category_id=...&search=...&page=1&limit=20
   */
  getPlants: async ({ categoryId, search, page = 1, limit = 20 } = {}) => {
    const params = mapPlantsParams({ categoryId, search, page, limit });

    const response = await api.get("/plants", { params });
    return adaptPlantsList(response.data);
  },

  /**
   * Lay chi tiet mot cay theo ID
   * GET /api/plants/:id
   */
  getPlantById: async (id) => {
    const response = await api.get(`/plants/${id}`);
    return response.data; // { success, message, data: plant }
  },

  getManagerPlants: async ({ search, page = 1, limit = 50 } = {}) => {
    const response = await api.get("/plants/manager", {
      params: mapPlantsParams({ search, page, limit }),
    });
    return adaptPlantsList(response.data);
  },

  createPlant: (plant, photo) => savePlant("post", "/plants/manager", plant, photo),
  updatePlant: (id, plant, photo) => savePlant("put", `/plants/manager/${id}`, plant, photo),
  deletePlant: async (id) => (await api.delete(`/plants/manager/${id}`)).data,
};

export default plantService;
