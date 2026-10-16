// src/services/authService.js - Goi API lien quan toi Auth
import api from "./api";

export const authService = {
  // Buoc 1: Gui ma OTP dang ky
  sendRegisterOTP: async ({ fullName, email, password, phone }) => {
    const response = await api.post("/auth/register/send-otp", {
      fullName,
      email,
      password,
      phone,
    });
    return response.data;
  },

  // Buoc 2: Xac thuc ma OTP va tao tai khoan
  verifyRegisterOTP: async ({ email, otp }) => {
    const response = await api.post("/auth/register/verify-otp", {
      email,
      otp,
    });
    return response.data;
  },

  // Dang nhap
  login: async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Dang xuat
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Lay thong tin user hien tai
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Quen mat khau - Gui ma OTP ve email
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Dat lai mat khau bang ma OTP
  resetPassword: async ({ email, otp, newPassword }) => {
    const response = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};

export default authService;