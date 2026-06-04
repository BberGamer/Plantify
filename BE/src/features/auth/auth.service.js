// auth.service.js - Nghiệp vụ đăng ký, đăng nhập
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');

const STATUS_MANAGED_ROLES = ['customer', 'business manager', 'content manager'];

const createUserRecord = async (userData, role) => {
  const { fullName, email, phone, address, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('Email đã được sử dụng bởi tài khoản khác');
    err.statusCode = 400;
    throw err;
  }

  if (phone && phone.trim() !== '') {
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      const err = new Error('Số điện thoại đã được sử dụng bởi tài khoản khác');
      err.statusCode = 400;
      throw err;
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    fullName,
    email,
    phone,
    address,
    password: hashedPassword,
    role,
    status: 'active',
  });

  const userObj = newUser.toObject();
  delete userObj.password;
  return userObj;
};

/**
 * Đăng ký tài khoản người dùng mới
 * @param {object} userData - Thông tin từ client (fullName, email, phone, address, password)
 * @returns {Promise<object>} user - Đối tượng user đã được tạo (không bao gồm password)
 */
const register = async (userData) => {
  return createUserRecord(userData, 'customer');
};

/**
 * Tạo tài khoản người dùng bởi quản trị viên
 * @param {object} userData - Thông tin từ client (fullName, email, phone, address, password, role)
 * @returns {Promise<object>} user - Đối tượng user đã được tạo (không bao gồm password)
 */
const createUserByAdmin = async (userData) => {
  return createUserRecord(userData, userData.role);
};

/**
 * Đăng nhập người dùng
 * @param {string} email - Email đăng nhập
 * @param {string} password - Mật khẩu đăng nhập
 * @returns {Promise<object>} { user, token }
 */
const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Email hoặc mật khẩu không chính xác');
    err.statusCode = 401;
    throw err;
  }

  if (user.status !== 'active') {
    const err = new Error('Tài khoản đã bị khóa');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Email hoặc mật khẩu không chính xác');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

/**
 * Lấy thông tin user hiện tại
 * @param {string} userId - ID người dùng
 * @returns {Promise<object>} user
 */
const getMe = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('Không tìm thấy người dùng');
    err.statusCode = 444;
    throw err;
  }
  return user;
};

/**
 * Lấy danh sách người dùng cho quản trị viên
 * @returns {Promise<object[]>} users
 */
const getUsers = async () => {
  return User.find().select('-password').sort({ createdAt: -1 });
};

/**
 * Cập nhật trạng thái hoạt động của người dùng
 * @param {string} userId - ID người dùng
 * @param {string} status - active | inactive
 * @returns {Promise<object>} user
 */
const updateUserStatus = async (userId, status) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng');
    err.statusCode = 404;
    throw err;
  }

  if (!STATUS_MANAGED_ROLES.includes(user.role)) {
    const err = new Error('Không thể cập nhật trạng thái tài khoản có vai trò này');
    err.statusCode = 400;
    throw err;
  }

  user.status = status;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

module.exports = {
  register,
  createUserByAdmin,
  login,
  getMe,
  getUsers,
  updateUserStatus,
};
