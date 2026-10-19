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

module.exports = {
  getUsers,
  getUserById,
};
