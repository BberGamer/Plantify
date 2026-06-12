// auth.service.js - Nghiệp vụ đăng ký, đăng nhập
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./auth.model');
const { sendOTPEmail, sendRegisterOTPEmail } = require('../../utils/email');

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
 * In-memory store lưu tạm thông tin đăng ký chờ xác thực OTP
 * Key: email (normalized), Value: { userData, hashedOTP, hashedPassword, expires }
 */
const pendingRegistrations = new Map();

/**
 * Gửi OTP xác thực đăng ký — kiểm tra trùng email/SĐT rồi tạo pending user và gửi OTP
 * @param {object} userData - { fullName, email, phone, address, password }
 * @returns {Promise<void>}
 */
/**
 * Gửi OTP xác thực đăng ký
 * Kiểm tra trùng email/SĐT trong DB rồi lưu tạm vào memory, KHÔNG ghi DB.
 * @param {object} userData - { fullName, email, phone, address, password }
 * @returns {Promise<void>}
 */
const sendRegisterOTP = async (userData) => {
  const { fullName, email, phone, address, password } = userData;
  const normalizedEmail = email.toLowerCase().trim();

  // Kiểm tra email đã tồn tại trong DB (chỉ active user)
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    const err = new Error('Email đã được sử dụng bởi tài khoản khác');
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra SĐT đã tồn tại trong DB
  if (phone && phone.trim() !== '') {
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      const err = new Error('Số điện thoại đã được sử dụng bởi tài khoản khác');
      err.statusCode = 400;
      throw err;
    }
  }

  // Tạo OTP 6 số và hash mật khẩu trước khi lưu tạm
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  const expires = Date.now() + 5 * 60 * 1000; // 5 phút

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Lưu tạm vào memory (ghi đè nếu có yêu cầu cũ cho email này)
  pendingRegistrations.set(normalizedEmail, {
    fullName,
    email: normalizedEmail,
    phone: phone || '',
    address: address || '',
    hashedPassword,
    hashedOTP,
    expires,
  });

  // Gửi OTP qua email đăng ký
  try {
    await sendRegisterOTPEmail(normalizedEmail, otp);
  } catch (error) {
    // Nếu gửi thất bại thì xóa khỏi memory để tránh rác
    pendingRegistrations.delete(normalizedEmail);
    const err = new Error('Không thể gửi email OTP lúc này, vui lòng kiểm tra mạng hoặc thử lại sau.');
    err.statusCode = 500;
    throw err;
  }
};

/**
 * Xác thực OTP đăng ký
 * Nếu OTP hợp lệ thì mới tạo user thật trong DB.
 * @param {string} email - Email người dùng
 * @param {string} otp - Mã OTP 6 số từ người dùng
 * @returns {Promise<object>} user - Thông tin user vừa được tạo
 */
const verifyRegisterOTP = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Lấy thông tin tạm từ memory
  const pending = pendingRegistrations.get(normalizedEmail);
  if (!pending) {
    const err = new Error('Không tìm thấy yêu cầu đăng ký cho email này. Vui lòng thử đăng ký lại.');
    err.statusCode = 404;
    throw err;
  }

  // Kiểm tra hạn OTP
  if (pending.expires < Date.now()) {
    pendingRegistrations.delete(normalizedEmail);
    const err = new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.');
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra OTP
  const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');
  if (pending.hashedOTP !== hashedOTP) {
    const err = new Error('Mã OTP không chính xác');
    err.statusCode = 400;
    throw err;
  }

  // OTP hợp lệ — tạo user thật trong DB
  const newUser = await User.create({
    fullName: pending.fullName,
    email: pending.email,
    phone: pending.phone,
    address: pending.address,
    password: pending.hashedPassword,
    role: 'customer',
    status: 'active',
  });

  // Xóa khỏi memory sau khi tạo thành công
  pendingRegistrations.delete(normalizedEmail);

  const userObj = newUser.toObject();
  delete userObj.password;
  return userObj;
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

/**
 * Xóa tài khoản người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng');
    err.statusCode = 404;
    throw err;
  }

  if (!STATUS_MANAGED_ROLES.includes(user.role)) {
    const err = new Error('Không thể xóa tài khoản có vai trò này');
    err.statusCode = 400;
    throw err;
  }

  await User.findByIdAndDelete(userId);
};

/**
 * Tạo và gửi mã OTP đặt lại mật khẩu qua email
 * @param {string} email - Email người dùng
 * @returns {Promise<void>}
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const err = new Error('Không tìm thấy tài khoản với email này');
    err.statusCode = 404;
    throw err;
  }

  if (user.status !== 'active') {
    const err = new Error('Tài khoản đã bị khóa, không thể đặt lại mật khẩu');
    err.statusCode = 403;
    throw err;
  }

  // Tạo OTP gồm 6 số ngẫu nhiên
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP để lưu trữ bảo mật trong database
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  user.resetPasswordOTP = hashedOTP;
  user.resetPasswordOTPExpires = new Date(Date.now() + 5 * 60 * 1000); // Hạn 5 phút
  await user.save();

  // Gửi OTP chưa hash tới email người dùng
  try {
    await sendOTPEmail(user.email, otp);
  } catch (error) {
    const err = new Error('Không thể gửi email OTP lúc này, vui lòng kiểm tra mạng hoặc thử lại sau.');
    err.statusCode = 500;
    throw err;
  }
};

/**
 * Đặt lại mật khẩu bằng OTP
 * @param {string} email - Email của tài khoản cần reset
 * @param {string} otp - Mã OTP từ người dùng
 * @param {string} newPassword - Mật khẩu mới
 * @returns {Promise<void>}
 */
const resetPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const err = new Error('Không tìm thấy tài khoản với email này');
    err.statusCode = 404;
    throw err;
  }

  if (!user.resetPasswordOTPExpires || user.resetPasswordOTPExpires < Date.now()) {
    const err = new Error('Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.');
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra mã OTP bằng cách hash mã đầu vào và so sánh với DB
  const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');
  if (user.resetPasswordOTP !== hashedOTP) {
    const err = new Error('Mã OTP xác thực không chính xác');
    err.statusCode = 400;
    throw err;
  }

  // Cập nhật mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Xóa mã OTP và hạn sử dụng sau khi cập nhật thành công
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpires = null;
  await user.save();
};

/**
 * Xác thực mã OTP mà không đặt lại mật khẩu
 * Dùng để kiểm tra OTP ở trang /forgot-password trước khi sang trang /reset-password
 * @param {string} email - Email của tài khoản
 * @param {string} otp - Mã OTP 6 số từ người dùng
 * @returns {Promise<void>}
 */
const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const err = new Error('Không tìm thấy tài khoản với email này');
    err.statusCode = 404;
    throw err;
  }

  if (!user.resetPasswordOTPExpires || user.resetPasswordOTPExpires < Date.now()) {
    const err = new Error('Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.');
    err.statusCode = 400;
    throw err;
  }

  const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');
  if (user.resetPasswordOTP !== hashedOTP) {
    const err = new Error('Mã OTP không chính xác');
    err.statusCode = 400;
    throw err;
  }
  // OTP hợp lệ — không xóa để reset-password có thể dùng lại
};

module.exports = {
  register,
  sendRegisterOTP,
  verifyRegisterOTP,
  createUserByAdmin,
  login,
  getMe,
  getUsers,
  updateUserStatus,
  deleteUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
