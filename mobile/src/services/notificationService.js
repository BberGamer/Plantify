import api from "./api";

export default {
  list: async (params) => (await api.get("/notifications", { params })).data,
  markRead: async (id) => (await api.patch(`/notifications/${id}/read`)).data,
};
