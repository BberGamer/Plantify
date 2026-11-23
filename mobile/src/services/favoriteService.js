import api from "./api";
import { adaptPlantsList } from "./listAdapters";
import { sessionError } from "./sessionAccess";

const endpoint = "/favorites/plants";

export default {
  getPlants: async (params, sessionContext) => adaptPlantsList(
    (await api.get(endpoint, { params, sessionContext })).data,
  ),
  getStatus: async (ids, sessionContext) => {
    const response = (await api.get(`${endpoint}/status`, {
      params: { ids: ids.join(",") }, sessionContext,
    })).data;
    const favorites = response?.data?.favorite_ids;
    if (response?.success !== true || !Array.isArray(favorites) ||
        favorites.some((id) => typeof id !== "string" || !ids.includes(id)))
      throw sessionError("INVALID_RESPONSE");
    return favorites;
  },
  setFavorite: async (id, value, sessionContext) => {
    const response = value
      ? await api.put(`${endpoint}/${id}`, {}, { sessionContext })
      : await api.delete(`${endpoint}/${id}`, { sessionContext });
    if (response.data?.success !== true || response.data.data?.plant_id !== id ||
        response.data.data?.is_favorite !== value) throw sessionError("INVALID_RESPONSE");
    return response.data;
  },
};
