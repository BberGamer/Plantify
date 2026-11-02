import api from "./api";
import { Platform } from "react-native";
import { getSessionContext } from "./sessionAccess";

const invalid = () => {
  const error = new Error("Dữ liệu vườn cây không hợp lệ.");
  error.code = "INVALID_RESPONSE";
  throw error;
};

const adaptList = (envelope) => {
  if (envelope?.success !== true || !Array.isArray(envelope.data?.plants)) invalid();
  const { plants, total, page, limit, totalPages } = envelope.data;
  if (![total, page, limit, totalPages].every(Number.isSafeInteger)) invalid();
  return {
    ...envelope,
    data: {
      items: plants,
      pagination: {
        page, limit, total, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: total > 0 && page > 1,
      },
    },
  };
};

export default {
  createPlant: async (fields, photo) => {
    const sessionContext = getSessionContext();
    let body = fields;
    if (photo) {
      body = new FormData();
      for (const [key, value] of Object.entries(fields)) body.append(key, String(value));
      if (Platform.OS === "web") {
        const blob = await (await fetch(photo.uri)).blob();
        body.append("photo", blob, photo.fileName || "plant.jpg");
      } else {
        body.append("photo", { uri: photo.uri, name: photo.fileName || "plant.jpg", type: photo.mimeType || "image/jpeg" });
      }
    }
    return (await api.post("/garden/plants", body, {
      sessionContext,
      ...(photo ? { headers: { "Content-Type": Platform.OS === "web" ? false : "multipart/form-data" } } : {}),
    })).data;
  },
  getPlants: async ({ page = 1, limit = 50, search, healthStatus } = {}) => {
    const params = { page, limit };
    if (search?.trim()) params.search = search.trim();
    if (healthStatus && healthStatus !== "all") params.health_status = healthStatus;
    return adaptList((await api.get("/garden/plants", { params })).data);
  },
  getPlant: async (id) => (await api.get(`/garden/plants/${id}`)).data,
};
