import api from "./api";
export default {
  list: async (params) => (await api.get("/care-schedules", { params })).data,
  create: async (body) => (await api.post("/care-schedules", body)).data,
  complete: async (id, date) => (await api.patch(`/care-schedules/${id}/complete`, { date })).data,
  remove: async (id) => (await api.delete(`/care-schedules/${id}`)).data,
};
