// api.js
// Axios instance gọi API backend (base URL từ env)
import axios from "axios";
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete config.headers["Content-Type"];
    }
  }

  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu token hết hạn hoặc không hợp lệ (401), có thể tự động clear localStorage
    if (error.response && error.response.status === 401 && !error.config?.skipAuthExpiry) {
      const requestAuthHeader = error.config?.headers?.Authorization;
      const currentToken = localStorage.getItem("token");
      const currentAuthHeader = currentToken ? `Bearer ${currentToken}` : null;

      if (!requestAuthHeader || requestAuthHeader === currentAuthHeader) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-expired"));
      }
    }
    return Promise.reject(error);
  }
);
export {
  api
};
