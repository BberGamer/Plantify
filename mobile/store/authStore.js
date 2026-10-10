import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constants } from '../src/utils/constants';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  
  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem(constants.TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(constants.USER_KEY);
      
      if (token && userStr) {
        set({
          token,
          user: JSON.parse(userStr),
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (e) {
      set({ isLoading: false, isAuthenticated: false, error: e.message });
    }
  },
  
  login: async (userData, token) => {
    try {
      await AsyncStorage.setItem(constants.TOKEN_KEY, token);
      await AsyncStorage.setItem(constants.USER_KEY, JSON.stringify(userData));
      set({
        user: userData,
        token,
        isAuthenticated: true,
        error: null
      });
    } catch (e) {
      set({ error: e.message });
    }
  },
  
  logout: async () => {
    try {
      await AsyncStorage.removeItem(constants.TOKEN_KEY);
      await AsyncStorage.removeItem(constants.USER_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
    } catch (e) {
      console.error('Logout error', e);
    }
  },
  
  updateUser: (user) => set({ user }),
  setError: (error) => set({ error }),
}));
