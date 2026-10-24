// src/services/userService.js - Goi API Quan ly Nguoi dung (Admin User Management)
import api from "./api";
import { adaptUsersList, mapUsersParams } from "./listAdapters";

const userService = {
  /**
   * Lay danh sach nguoi dung (phan trang, tim kiem, loc)
   * @param {object} params - { page, limit, search, role, status, sortBy, sortOrder }
   */
  getUsers: async (params = {}) => {
    const response = await api.get("/users", {
      params: mapUsersParams(params),
    });
    return adaptUsersList(response.data);
  },

  /**
   * Xem chi tiet tai khoan nguoi dung theo ID
   * @param {string} userId
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Cap nhat thong tin & trang thai nguoi dung (fullName, phone, status, role)
   * @param {string} userId
   * @param {object} data
   */
  updateUser: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Khoa hoac kich hoat tai khoan nguoi dung (status: true / false)
   * @param {string} userId
   * @param {boolean} status
   */
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  /**
   * Gan vai tro he thong (Customer / Manager / Admin)
   * @param {string} userId
   * @param {string} role - 'customer' | 'manager' | 'admin'
   */
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
  },
};

export default userService;
