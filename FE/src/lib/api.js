// api.js
// Axios instance gọi API backend (base URL từ env)
import axios from "axios";
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 1e4
});
api.interceptors.request.use((config) => config);
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
export {
  api
};
