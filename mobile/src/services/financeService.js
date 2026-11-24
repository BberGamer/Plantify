import api from "./api";
const root = "/commerce";
const data = (response) => {
  if (response.data?.success !== true)
    throw new Error("Invalid finance response");
  return response.data.data;
};
export default {
  summary: () => api.get(`${root}/me`).then(data),
  list: (kind, params, admin = false) =>
    api.get(`${root}/${admin ? "admin/" : ""}${kind}`, { params }).then(data),
  order: (id) => api.get(`${root}/orders/${id}`).then(data),
  topup: (body) => api.post(`${root}/orders`, body).then(data),
  purchase: (body) => api.post(`${root}/vip/purchase`, body).then(data),
  review: (id, body) =>
    api.patch(`${root}/admin/orders/${id}`, body).then(data),
  adjust: (body) => api.post(`${root}/admin/adjustments`, body).then(data),
};
