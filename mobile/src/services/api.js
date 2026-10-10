import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constants } from '../utils/constants';

// Default URLs for testing
const LOCAL_API = 'http://192.168.1.100:5000/api'; // Replace with your IP

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || LOCAL_API,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(constants.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized
      await AsyncStorage.removeItem(constants.TOKEN_KEY);
      await AsyncStorage.removeItem(constants.USER_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
