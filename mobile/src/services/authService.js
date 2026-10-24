// src/services/authService.js - Goi API lien quan toi Auth
import api from "./api";

const authService = {
  // Server tự xác định user từ token, không gửi id tài khoản cần sửa.
  updateProfile: async (data, sessionContext) => {
    const response = await api.patch("/auth/me", data, { sessionContext });
    return response.data;
  },
  // Buoc 1: Gui ma OTP dang ky
  sendRegisterOTP: async ({ fullName, email, password, phone }) => {
    const response = await api.post(
      "/auth/register/send-otp",
      {
        fullName,
        email,
        password,
        phone,
      },
      { anonymous: true },
    );
    return response.data;
  },

  // Buoc 2: Xac thuc ma OTP va tao tai khoan
  verifyRegisterOTP: async ({ email, otp }) => {
    const response = await api.post(
      "/auth/register/verify-otp",
      {
        email,
        otp,
      },
      { anonymous: true },
    );
    return response.data;
  },

  // Dang nhap
  login: async ({ email, password }) => {
    const response = await api.post(
      "/auth/login",
      { email, password },
      { anonymous: true },
    );
    return response.data;
  },

  // Dang xuat
  logout: async (sessionContext) => {
    // Không để thao tác thoát bị treo theo timeout 30 giây của API chung.
    // Store vẫn xóa phiên trên máy nếu server không phản hồi.
    const response = await api.post("/auth/logout", undefined, {
      timeout: 3000,
      sessionContext,
      allowStaleSession: true,
    });
    return response.data;
  },

  // Lay thong tin user hien tai
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Quen mat khau - Gui ma OTP ve email
  forgotPassword: async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email },
      { anonymous: true },
    );
    return response.data;
  },

  // Dat lai mat khau bang ma OTP
  resetPassword: async ({ email, otp, newPassword }) => {
    const response = await api.post(
      "/auth/reset-password",
      {
        email,
        otp,
        newPassword,
      },
      { anonymous: true },
    );
    return response.data;
  },
};

export default authService;
