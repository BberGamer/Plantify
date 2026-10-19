// store/authStore.js - Quan ly state xac thuc toan cuc bang Zustand
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../src/services/authService";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Load token va user da luu khi mo app
  loadUser: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem("token");
      const savedUser = await AsyncStorage.getItem("user");
      if (token && savedUser) {
        set({
          token,
          user: JSON.parse(savedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  // Dang nhap
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.login({ email, password });
      const { user, token } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Đăng nhập thất bại";
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  // Luu user va token sau khi verify OTP thanh cong
  setAuthSession: async (user, token) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  // Ghi store ngay sau khi server lưu thành công để Profile và Home cùng cập nhật.
  // Chỉ lưu user trả về, không lưu các ô mật khẩu trên form.
  updateProfile: async (data) => {
    const response = await authService.updateProfile(data);
    const user = response.data;
    set({ user });
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return { cacheSaved: true };
    } catch {
      return { cacheSaved: false }; // MongoDB đã lưu; không báo nhầm là lưu thất bại.
    }
  },

  // Đăng xuất và xóa phiên trên máy.
  logout: async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      await AsyncStorage.multiRemove(["token", "user"]);
      // Xóa cả trạng thái chờ/lỗi cũ để AuthGuard có thể chuyển về Login.
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
