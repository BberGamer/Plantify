import api from "./api";

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
  getPlants: async ({ page = 1, limit = 50, search, healthStatus } = {}) => {
    const params = { page, limit };
    if (search?.trim()) params.search = search.trim();
    if (healthStatus && healthStatus !== "all") params.health_status = healthStatus;
    return adaptList((await api.get("/garden/plants", { params })).data);
  },
  getPlant: async (id) => (await api.get(`/garden/plants/${id}`)).data,
};
