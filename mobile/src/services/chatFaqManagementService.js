import api from "./api";
const base = "/chat-faqs/manager";
export default {
  list: async (params) => (await api.get(base, { params })).data,
  listTurns: async (params) => (await api.get(`${base}/chat-turns`, { params })).data,
  create: async (data) => (await api.post(base, data)).data,
  update: async (id, data) => (await api.put(`${base}/${id}`, data)).data,
  remove: async (id, version) => (await api.delete(`${base}/${id}`, { data: { version } })).data,
  approve: async (id, version) => (await api.patch(`${base}/${id}/approve`, { version })).data,
  unapprove: async (id, version) => (await api.patch(`${base}/${id}/unapprove`, { version })).data,
};
