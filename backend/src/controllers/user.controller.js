// controllers/user.controller.js - Dieu phoi HTTP request & response cho User Management
const userService = require("../services/user.service");
const { success } = require("../utils/api-response");

/**
 * [GET] /api/v1/users hoac /api/v1/admin/users
 * Lay danh sach nguoi dung cho Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.query);
    return success(res, "Lấy danh sách người dùng thành công", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /api/v1/users/:id
 * Lay chi tiet thong tin mot nguoi dung theo ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return success(res, "Lấy thông tin người dùng thành công", user, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * [PUT / PATCH] /api/v1/users/:id
 * Cap nhat thong tin & trang thai nguoi dung (Active / Banned)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user?.id;
    const updatedUser = await userService.updateUserInfoAndStatus(id, req.body, currentAdminId);
    return success(res, "Cập nhật thông tin và trạng thái người dùng thành công", updatedUser, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * [PATCH] /api/v1/users/:id/status
 * Khoa / Mo khoa tai khoan nguoi dung (Deactivate / Ban user account)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const currentAdminId = req.user?.id;
    const updatedUser = await userService.updateUserStatus(id, status, currentAdminId);
    const msg = updatedUser.status ? "Kích hoạt tài khoản thành công" : "Khóa tài khoản người dùng thành công";
    return success(res, msg, updatedUser, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * [PATCH] /api/v1/users/:id/role
 * Quan ly vai tro he thong (Manage System Roles: Customer / Manager / Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user?.id;
    const updatedUser = await userService.updateUserRole(id, role, currentAdminId);
    return success(res, "Cập nhật vai trò người dùng thành công", updatedUser, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
};
