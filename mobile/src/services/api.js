// src/services/api.js - Cau hinh Axios instance cho Mobile App
import axios from "axios";
import { Platform } from "react-native";
import {
  getSessionContext,
  isSessionCurrent,
  expireRequestSession,
  sessionError,
} from "./sessionAccess";

// Dia chi IP backend (ho tro Android Emulator 10.0.2.2 va iOS/Web localhost)
const getDefaultBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api/v1";
  }
  return "http://localhost:5000/api/v1";
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || getDefaultBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Chụp phiên lúc gửi; storage không tham gia vào nguồn Authorization của request.
api.interceptors.request.use(
  (config) => {
    const context = config.anonymous
      ? null
      : config.sessionContext || getSessionContext();
    if (
      config.sessionContext &&
      !config.allowStaleSession &&
      !isSessionCurrent(context)
    ) {
      throw sessionError("SESSION_CHANGED");
    }
    config.requestSession = context;
    config.headers = config.headers || {};
    for (const key of Object.keys(config.headers)) {
      if (key.toLowerCase() === "authorization") delete config.headers[key];
    }
    if (context?.token)
      config.headers.Authorization = `Bearer ${context.token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const context = error.config?.requestSession;
    const status = error.response?.status;
    const code = error.response?.data?.code;
    if (
      context?.token &&
      (status === 401 || (status === 403 && code === "ACCOUNT_LOCKED"))
    ) {
      expireRequestSession(context);
    }
    return Promise.reject(error);
  },
);

export default api;
