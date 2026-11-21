import api from "./api";

export default {
  list: async (params) => (await api.get("/notifications", { params })).data,
  detail: async (id, sessionContext) => (await api.get(`/notifications/${id}`, { sessionContext })).data,
  markRead: async (id, sessionContext) => (await api.patch(`/notifications/${id}/read`, {}, { sessionContext })).data,
  preferences: async () => (await api.get("/notifications/preferences")).data,
  updatePreferences: async (enabled) => (await api.patch("/notifications/preferences",
    { treatment_reminders: enabled })).data,
};
