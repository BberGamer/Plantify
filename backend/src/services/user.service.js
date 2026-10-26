const AppError = require("../utils/app-error");
const v = require("../validators/common");
// services/user.service.js - Logic nghiep vu Quan ly Nguoi dung (User Management)
const validate = require("../validators/user.validator");
const User = require("../models/user.model");

// Các endpoint quản lý người dùng chỉ cho phép actor có vai trò admin.
const assertUserEditable = (user) => {
  if (user.role === "admin") {
    throw new AppError(
      "SAME_ROLE_UPDATE_FORBIDDEN",
      403,
      "Tài khoản cùng vai trò chỉ được xem, không được chỉnh sửa.",
    );
  }
};

/**
 * Lay danh sach nguoi dung cho Admin
 * Ho tro phan trang (pagination), tim kiem (search) va loc (filter theo role, status)
 *
 * @param {object} query - Cac tham so query tu request
 * @param {number} [query.page=1] - So trang hien tai
 * @param {number} [query.limit=10] - So ban ghi tren moi trang
 * @param {string} [query.search] - Tu khoa tim kiem (ho ten, email, so dien thoai)
 * @param {string} [query.role] - Loc theo vai tro: customer | admin | manager
 * @param {string|boolean} [query.status] - Loc theo trang thai hoat dong (true/false)
 * @param {string} [query.sortBy="createdAt"] - Truong sap xep
 * @param {string} [query.sortOrder="desc"] - Thu tu sap xep: asc | desc
 * @returns {Promise<object>} Danh sach user va thong tin phan trang
 */
const getUsers = async (query = {}) => {
  query = validate.query(query);
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Xay dung filter query cho MongoDB
  const filter = {};

  // Tim kiem gan dung khong phan biet hoa thuong (fullName, email, phone)
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(v.escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  // Loc theo vai tro (role)
  if (
    query.role &&
    ["customer", "admin", "manager"].includes(query.role.trim())
  ) {
    filter.role = query.role.trim();
  }

  // Loc theo trang thai hoat dong (status)
  if (query.status !== undefined && query.status !== "") {
    if (query.status === "true" || query.status === true) {
      filter.status = true;
    } else if (query.status === "false" || query.status === false) {
      filter.status = false;
    }
  }

  // Sap xep (sort)
  const allowedSortFields = [
    "createdAt",
    "fullName",
    "email",
    "role",
    "status",
  ];
  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  // Dem tong so ban ghi thoa man dieu kien
  const totalUsers = await User.countDocuments(filter);

  // Truy van danh sach user, bo qua truong nhay cam (password, reset OTP)
  const users = await User.find(filter)
    .select("-password -resetPasswordOTP -resetPasswordOTPExpires")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return {
    pagination: {
      totalUsers,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    users,
  };
};

/**
 * Lay thong tin chi tiet 1 nguoi dung theo ID
 * @param {string} userId - ID cua nguoi dung
 * @returns {Promise<object>} Thong tin user khong kem password
 */
const getUserById = async (userId) => {
  v.id(userId);

  const user = await User.findById(userId)
    .select("-password -resetPasswordOTP -resetPasswordOTPExpires")
    .lean();

  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      404,
      "Không tìm thấy người dùng với ID này.",
    );
  }

  return user;
};

/**
 * 1. Cap nhat thong tin nguoi dung & trang thai (Active / Banned)
 * @param {string} userId - ID cua nguoi dung can cap nhat
 * @param {object} updateData - Du lieu can cap nhat (fullName, phone, status, role)
 * @param {string} currentAdminId - ID cua Admin dang thao tac
 * @returns {Promise<object>} Thong tin user sau khi cap nhat
 */
const updateUserInfoAndStatus = async (
  userId,
  updateData = {},
  currentAdminId,
) => {
  updateData = validate.update(updateData);
  v.id(userId);

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      404,
      "Không tìm thấy người dùng với ID này.",
    );
  }

  const { fullName, phone, status, role } = updateData;
  const isSelf = user._id.toString() === currentAdminId?.toString();
  if (!isSelf || role !== undefined || status !== undefined) assertUserEditable(user);

  // Cap nhat ho ten
  if (fullName !== undefined) {
    user.fullName = fullName.trim();
  }

  // Cap nhat so dien thoai
  if (phone !== undefined) {
    const trimmedPhone = phone.trim();
    if (trimmedPhone !== "") {
      const existingPhone = await User.findOne({
        phone: trimmedPhone,
        _id: { $ne: userId },
      });
      if (existingPhone) {
        throw new AppError(
          "PHONE_IN_USE",
          400,
          "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
        );
      }
    }
    user.phone = trimmedPhone;
  }

  // Cap nhat trang thai (Active / Banned)
  if (status !== undefined) {
    const parsedStatus =
      status === "true" || status === true
        ? true
        : status === "false" || status === false
          ? false
          : null;

    if (
      userId.toString() === currentAdminId?.toString() &&
      parsedStatus === false
    ) {
      throw new AppError(
        "SELF_LOCK_FORBIDDEN",
        400,
        "Bạn không thể tự khóa tài khoản của chính mình.",
      );
    }
    user.status = parsedStatus;
  }

  // Cap nhat vai tro (Role: customer / manager / admin)
  if (role !== undefined) {
    const normalizedRole = role;

    if (
      userId.toString() === currentAdminId?.toString() &&
      normalizedRole !== "admin"
    ) {
      throw new AppError(
        "SELF_ROLE_CHANGE_FORBIDDEN",
        400,
        "Bạn không thể tự hạ quyền vai trò quản trị viên của chính mình.",
      );
    }
    user.role = normalizedRole;
  }

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordOTP;
  delete userObj.resetPasswordOTPExpires;

  return userObj;
};

/**
 * 2. Khoa / Kich hoat tai khoan nguoi dung (Deactivate / Ban user account)
 * @param {string} userId - ID nguoi dung
 * @param {boolean} status - true (Active) hoac false (Banned / Deactivated)
 * @param {string} currentAdminId - ID Admin dang thuc hien
 * @returns {Promise<object>} Thong tin user sau cap nhat
 */
const updateUserStatus = async (userId, status, currentAdminId) => {
  status = v.boolean(status, "status");
  v.id(userId);

  const parsedStatus =
    status === "true" || status === true
      ? true
      : status === "false" || status === false
        ? false
        : null;

  if (
    userId.toString() === currentAdminId?.toString() &&
    parsedStatus === false
  ) {
    throw new AppError(
      "SELF_LOCK_FORBIDDEN",
      400,
      "Bạn không thể tự khóa tài khoản của chính mình.",
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      404,
      "Không tìm thấy người dùng với ID này.",
    );
  }

  assertUserEditable(user);
  user.status = parsedStatus;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordOTP;
  delete userObj.resetPasswordOTPExpires;

  return userObj;
};

/**
 * 3. Quan ly vai tro he thong (Manage System Roles: customer / manager / admin)
 * @param {string} userId - ID nguoi dung
 * @param {string} role - Vai tro moi (customer, manager, admin)
 * @param {string} currentAdminId - ID Admin dang thuc hien
 * @returns {Promise<object>} Thong tin user sau cap nhat
 */
const updateUserRole = async (userId, role, currentAdminId) => {
  role = validate.role(role);
  v.id(userId);

  const normalizedRole = role;

  if (
    userId.toString() === currentAdminId?.toString() &&
    normalizedRole !== "admin"
  ) {
    throw new AppError(
      "SELF_ROLE_CHANGE_FORBIDDEN",
      400,
      "Bạn không thể tự hạ quyền vai trò quản trị viên của chính mình.",
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      404,
      "Không tìm thấy người dùng với ID này.",
    );
  }

  assertUserEditable(user);
  user.role = normalizedRole;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordOTP;
  delete userObj.resetPasswordOTPExpires;

  return userObj;
};

module.exports = {
  getUsers,
  getUserById,
  updateUserInfoAndStatus,
  updateUserStatus,
  updateUserRole,
};
