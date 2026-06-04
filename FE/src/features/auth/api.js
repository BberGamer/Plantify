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
  const response = await api.patch(
    `/auth/users/${userId}/status`,
    { status }
  );
  return response.data;
};