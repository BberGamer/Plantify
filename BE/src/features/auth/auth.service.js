// auth.service.js - Nghiệp vụ đăng ký, đăng nhập
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');

/**
 * Đăng ký tài khoản người dùng mới
 * @param {object} userData - Thông tin từ client (fullName, email, phone, address, password)
 * @returns {Promise<object>} user - Đối tượng user đã được tạo (không bao gồm password)
 */
const register = async (userData) => {
  const { fullName, email, phone, address, password } = userData;

  // 1. Kiểm tra email đã được đăng ký chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('Email đã được sử dụng bởi tài khoản khác');
    err.statusCode = 400;
    throw err;
  }

  // 1.2. Kiểm tra số điện thoại đã được đăng ký chưa (nếu có cung cấp)
  if (phone && phone.trim() !== '') {
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      const err = new Error('Số điện thoại đã được sử dụng bởi tài khoản khác');
      err.statusCode = 400;
      throw err;
    }
  }

  // 2. Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Tạo user mới với vai trò mặc định là 'customer'
  const newUser = await User.create({
    fullName,
    email,
    phone,
    address,
    password: hashedPassword,
    role: 'customer', // Mặc định và bắt buộc là customer
    status: 'active',
  });

  // 4. Trả về thông tin user (loại bỏ password)
  const userObj = newUser.toObject();
  delete userObj.password;
  return userObj;
};

/**
 * Đăng nhập người dùng
 * @param {string} email - Email đăng nhập
 * @param {string} password - Mật khẩu đăng nhập
 * @returns {Promise<object>} { user, token }
 */
const login = async (email, password) => {
  // 1. Tìm người dùng theo email
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Email hoặc mật khẩu không chính xác');
    err.statusCode = 401;
    throw err;
  }

  // 2. Kiểm tra trạng thái tài khoản
  if (user.status !== 'active') {
    const err = new Error('Tài khoản đã bị khóa');
    err.statusCode = 403;
    throw err;
  }

  // 3. So khớp mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Email hoặc mật khẩu không chính xác');
    err.statusCode = 401;
    throw err;
  }

  // 4. Tạo JWT token
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

  // 5. Trả về thông tin user (loại bỏ password) và token
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

module.exports = {
  register,
  login,
  getMe,
};
