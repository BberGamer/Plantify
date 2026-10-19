// services/user.service.js - Logic nghiep vu Quan ly Nguoi dung (User Management)
const User = require("../models/user.model");

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
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Xay dung filter query cho MongoDB
  const filter = {};

  // Tim kiem gan dung khong phan biet hoa thuong (fullName, email, phone)
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  // Loc theo vai tro (role)
  if (query.role && ["customer", "admin", "manager"].includes(query.role.trim())) {
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
  const allowedSortFields = ["createdAt", "fullName", "email", "role", "status"];
  const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : "createdAt";
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
  const user = await User.findById(userId)
    .select("-password -resetPasswordOTP -resetPasswordOTPExpires")
    .lean();

  if (!user) {
    const err = new Error("Không tìm thấy người dùng với ID này.");
    err.statusCode = 404;
    throw err;
  }

  return user;
};

module.exports = {
  getUsers,
  getUserById,
};
