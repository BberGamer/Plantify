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
 * Gửi OTP xác thực đăng ký — kiểm tra trùng email/SĐT và gửi mã OTP qua Gmail
 * @param {object} userData - { fullName, email, phone, address, password }
 * @returns {Promise<object>} response data
 */
export const sendRegisterOtpApi = async (userData) => {
  // Timeout 60s vì SMTP handshake có thể mất nhiều thời gian
  const response = await api.post("/auth/register/send-otp", userData, { timeout: 60000 });
  return response.data;
};

/**
 * Xác thực OTP đăng ký — kích hoạt tài khoản sau khi nhập đúng OTP
 * @param {string} email - Email đăng ký
 * @param {string} otp - Mã OTP 6 chữ số
 * @returns {Promise<object>} response data
 */
export const verifyRegisterOtpApi = async (email, otp) => {
  const response = await api.post("/auth/register/verify-otp", { email, otp });
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
 * @param {boolean} status - true | false
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
  // Timeout 60s vì SMTP handshake có thể mất nhiều thời gian
  const response = await api.post('/auth/forgot-password', { email }, { timeout: 60000 });
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

/**
 * Cập nhật thông tin cá nhân của người dùng đang đăng nhập
 * @param {object} profileData - { fullName, phone, address }
 * @returns {Promise<object>} response data
 */
export const updateProfileApi = async (profileData) => {
  const response = await api.patch('/auth/me', profileData);
  return response.data;
};

/** Lấy sổ địa chỉ của người dùng hiện tại. @returns {Promise<Object>} Dữ liệu danh sách địa chỉ. */
export const getMyAddressesApi = async () => {
  const response = await api.get('/auth/me/addresses');
  return response.data;
};

/** Tạo địa chỉ mới. @param {Object} addressData - Thông tin địa chỉ. @returns {Promise<Object>} Địa chỉ vừa tạo. */
export const createMyAddressApi = async (addressData) => {
  const response = await api.post('/auth/me/addresses', addressData);
  return response.data;
};

/** Cập nhật địa chỉ. @param {string} addressId - ID địa chỉ. @param {Object} addressData - Thông tin cập nhật. @returns {Promise<Object>} Địa chỉ sau cập nhật. */
export const updateMyAddressApi = async (addressId, addressData) => {
  const response = await api.patch(`/auth/me/addresses/${addressId}`, addressData);
  return response.data;
};

/** Xóa địa chỉ. @param {string} addressId - ID địa chỉ. @returns {Promise<Object>} Kết quả xóa. */
export const deleteMyAddressApi = async (addressId) => {
  const response = await api.delete(`/auth/me/addresses/${addressId}`);
  return response.data;
};

/** Đặt một địa chỉ làm mặc định. @param {string} addressId - ID địa chỉ. @returns {Promise<Object>} Địa chỉ mặc định sau cập nhật. */
export const setDefaultAddressApi = async (addressId) => {
  const response = await api.patch(`/auth/me/addresses/${addressId}/default`);
  return response.data;
};

/** Lấy dữ liệu tỉnh/thành và đơn vị hành chính Việt Nam. @param {string} [version="v2"] - Phiên bản API tỉnh thành. @returns {Promise<Array>} Danh sách tỉnh/thành từ provinces API. */
export const getVietnamProvincesApi = async (version = "v2") => {
  const path = version === "v2"
    ? "https://provinces.open-api.vn/api/v2/?depth=2"
    : "https://provinces.open-api.vn/api/?depth=3";
  const response = await fetch(path);
  return response.json();
};

/**
 * Đổi mật khẩu của người dùng đang đăng nhập
 * @param {object} passwordData - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise<object>} response data
 */
export const changePasswordApi = async (passwordData) => {
  const response = await api.patch('/auth/me/password', passwordData);
  return response.data;
};
