// api.js - Các hàm gọi API liên quan tới xác thực người dùng
import { api } from "@/lib/api";

/**
 * Gọi API đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} response data
 */
export const loginApi = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

/**
 * Gọi API đăng ký
 * @param {object} userData - { fullName, email, phone, address, password }
 * @returns {Promise<object>} response data
 */
export const registerApi = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

/**
 * Gọi API lấy thông tin người dùng hiện tại
 * @returns {Promise<object>} response data
 */
export const getMeApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

/**
 * Gọi API lấy danh sách người dùng cho quản trị viên
 * @returns {Promise<object>} response data
 */
export const getUsersApi = async () => {
  const response = await api.get("/auth/users");
  return response.data;
};

/**
 * Gọi API tạo tài khoản người dùng bởi quản trị viên
 * @param {object} userData - { fullName, email, phone, address, password, role }
 * @returns {Promise<object>} response data
 */
export const createAdminUserApi = async (userData) => {
  const response = await api.post("/auth/users", userData);
  return response.data;
};

/**
 * Gọi API cập nhật trạng thái người dùng
 * @param {string} userId
 * @param {string} status - active | inactive
 * @returns {Promise<object>} response data
 */
export const updateUserStatusApi = async (userId, status) => {
  const response = await api.patch(`/auth/users/${userId}/status`, { status });
  return response.data;
};

/**
 * Gọi API xóa người dùng
 * @param {string} userId
 * @returns {Promise<object>} response data
 */
export const deleteUserApi = async (userId) => {
  const response = await api.delete(`/auth/users/${userId}`);
  return response.data;
};

/**
 * Gọi API quên mật khẩu - gửi email đặt lại
 * @param {string} email - Email đã đăng ký
 * @returns {Promise<object>} response data
 */
export const forgotPasswordApi = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Gọi API xác thực mã OTP (trước khi đặt lại mật khẩu)
 * @param {string} email - Email tài khoản
 * @param {string} otp - Mã OTP 6 chữ số
 * @returns {Promise<object>} response data
 */
export const verifyOtpApi = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

/**
 * Gọi API đặt lại mật khẩu bằng OTP
 * @param {string} email - Email tài khoản
 * @param {string} otp - Mã OTP 6 chữ số
 * @param {string} password - Mật khẩu mới
 * @param {string} confirmPassword - Xác nhận mật khẩu mới
 * @returns {Promise<object>} response data
 */
export const resetPasswordApi = async (email, otp, password, confirmPassword) => {
  const response = await api.post('/auth/reset-password', { email, otp, password, confirmPassword });
  return response.data;
};
