// src/services/api.js - Cau hinh Axios instance cho Mobile App
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

// Interceptor tu dong gan JWT vao moi request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Khong lay duoc token tu storage:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;