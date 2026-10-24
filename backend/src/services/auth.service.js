// services/auth.service.js - Logic nghiep vu Xac thuc & Quan ly tai khoan
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const { sendOTPEmail } = require("../integrations/email/email.service");

// In-memory cache luu tru thong tin dang ky cho xac thuc OTP (5 phut)
const pendingRegistrations = new Map();

/**
 * Tao JWT Token cho nguoi dung (Han: 1 gio theo BR-07)
 */
const generateJwtToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    process.env.JWT_SECRET || "plantify_secret_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );
};

// === PHAN 1: DANG KY TAI KHOAN CO OTP ===

const sendRegisterOTP = async (userData) => {
  const { fullName, email, password, phone } = userData;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const err = new Error("Email này đã được sử dụng bởi một tài khoản khác.");
    err.statusCode = 400;
    throw err;
  }

  if (phone && phone.trim() !== "") {
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      const err = new Error(
        "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  const expires = Date.now() + 5 * 60 * 1000;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  pendingRegistrations.set(normalizedEmail, {
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : "",
    hashedPassword,
    hashedOTP,
    expires,
  });

  await sendOTPEmail(normalizedEmail, otp, "register");
};

const verifyRegisterOTP = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const pending = pendingRegistrations.get(normalizedEmail);

  if (!pending) {
    const err = new Error(
      "Không tìm thấy thông tin đăng ký cho email này hoặc đã hết hạn. Vui lòng đăng ký lại.",
    );
    err.statusCode = 404;
    throw err;
  }

  if (pending.expires < Date.now()) {
    pendingRegistrations.delete(normalizedEmail);
    const err = new Error(
      "Mã xác thực đã hết hạn (chỉ có hiệu lực trong 5 phút). Vui lòng yêu cầu mã mới.",
    );
    err.statusCode = 400;
    throw err;
  }

  const hashedInputOTP = crypto
    .createHash("sha256")
    .update(otp.trim())
    .digest("hex");
  if (pending.hashedOTP !== hashedInputOTP) {
    const err = new Error("Mã xác thực không chính xác. Vui lòng kiểm tra lại.");
    err.statusCode = 400;
    throw err;
  }

  const newUser = await User.create({
    fullName: pending.fullName,
    email: pending.email,
    phone: pending.phone,
    password: pending.hashedPassword,
    role: "customer",
    status: true,
    isGoogleAccount: false,
  });

  pendingRegistrations.delete(normalizedEmail);

  const token = generateJwtToken(newUser);
  const userObj = newUser.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

// === PHAN 2: DANG NHAP & DANG XUAT ===

const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const err = new Error("Email chưa được đăng ký trong hệ thống.");
    err.statusCode = 401;
    throw err;
  }

  if (!user.status) {
    const err = new Error(
      "Tài khoản của bạn đã bị khóa hoặc tạm ngưng. Vui lòng liên hệ hỗ trợ.",
    );
    err.statusCode = 403;
    throw err;
  }

  if (user.isGoogleAccount && !user.password) {
    const err = new Error(
      "Tài khoản này được đăng ký bằng Google. Vui lòng chọn 'Tiếp tục với Google'.",
    );
    err.statusCode = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Mật khẩu không chính xác. Vui lòng thử lại.");
    err.statusCode = 401;
    throw err;
  }

  const token = generateJwtToken(user);
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const logout = async (userId) => {
  return { message: "Đăng xuất thành công" };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const err = new Error("Không tìm thấy thông tin người dùng.");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

// === PHAN 3: QUEN MAT KHAU & RESET PASSWORD CO OTP ===

/**
 * Gui OTP quen mat khau toi email
 * @param {string} email
 */
const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const err = new Error("Không tìm thấy tài khoản với email này.");
    err.statusCode = 404;
    throw err;
  }

  if (!user.status) {
    const err = new Error("Tài khoản đã bị khóa, không thể đặt lại mật khẩu.");
    err.statusCode = 403;
    throw err;
  }

  // Tao OTP 6 chu so
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  user.resetPasswordOTP = hashedOTP;
  user.resetPasswordOTPExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phut theo BR-06
  await user.save();

  // Gui OTP email voi template reset
  await sendOTPEmail(user.email, otp, "reset");
};

/**
 * Xac thuc OTP va cap nhat mat khau moi
 * @param {string} email
 * @param {string} otp
 * @param {string} newPassword
 */
const resetPassword = async (email, otp, newPassword) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const err = new Error("Không tìm thấy tài khoản với email này.");
    err.statusCode = 404;
    throw err;
  }

  if (
    !user.resetPasswordOTPExpires ||
    user.resetPasswordOTPExpires < Date.now()
  ) {
    const err = new Error(
      "Mã xác thực đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.",
    );
    err.statusCode = 400;
    throw err;
  }

  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp.trim())
    .digest("hex");
  if (user.resetPasswordOTP !== hashedOTP) {
    const err = new Error("Mã xác thực không chính xác.");
    err.statusCode = 400;
    throw err;
  }

  // Hash va cap nhat mat khau moi
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Xoa OTP
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpires = null;
  await user.save();
};

// Chỉ sửa tài khoản của người đang đăng nhập; không nhận id/role/status từ client.
const updateProfile = async (userId, input = {}) => {
  const fail = (message, statusCode = 400) => {
    throw Object.assign(new Error(message), { statusCode });
  };
  const { fullName, email, phone, currentPassword, newPassword } = input;
  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    fullName.trim().length > 100
  )
    fail("Họ tên là bắt buộc và không quá 100 ký tự.");
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.length > 254
  )
    fail("Email không hợp lệ.");
  if (
    typeof phone !== "string" ||
    (phone.trim() && !/^0[35789]\d{8}$/.test(phone.trim()))
  )
    fail("Số điện thoại phải có 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.");
  if (
    newPassword !== undefined &&
    (typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      Buffer.byteLength(newPassword, "utf8") > 72)
  )
    fail("Mật khẩu mới cần ít nhất 8 ký tự và không quá 72 byte.");

  const user = await User.findById(userId);
  if (!user) fail("Không tìm thấy tài khoản.", 404);
  if (!user.status) fail("Tài khoản đã bị khóa.", 403);
  // Email là định danh đăng nhập: yêu cầu mật khẩu hiện tại khi đổi email/mật khẩu.
  const normalizedEmail = email.trim().toLowerCase();
  const sensitiveChange =
    normalizedEmail !== user.email || newPassword !== undefined;
  if (sensitiveChange) {
    if (user.isGoogleAccount)
      fail("Tài khoản Google không thể đổi email hoặc mật khẩu tại đây.");
    if (
      typeof currentPassword !== "string" ||
      !currentPassword ||
      !(await bcrypt.compare(currentPassword, user.password))
    )
      fail("Mật khẩu hiện tại không chính xác.");
  }
  const duplicate = await User.findOne({
    _id: { $ne: userId },
    $or: [
      { email: normalizedEmail },
      ...(phone.trim() ? [{ phone: phone.trim() }] : []),
    ],
  });
  if (duplicate) fail("Email hoặc số điện thoại đã được sử dụng.", 409);

  user.fullName = fullName.trim();
  user.email = normalizedEmail;
  user.phone = phone.trim();
  if (sensitiveChange) {
    // Hủy OTP cũ để không thể dùng lại sau khi thay đổi thông tin đăng nhập.
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
  }
  if (newPassword !== undefined)
    user.password = await bcrypt.hash(newPassword, 10);
  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) fail("Email đã được sử dụng.", 409);
    throw error;
  }
  // Chỉ trả thông tin hồ sơ, tuyệt đối không trả hash mật khẩu hoặc OTP.
  return {
    id: user.id,
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    isGoogleAccount: user.isGoogleAccount,
    createdAt: user.createdAt,
  };
};

module.exports = {
  updateProfile,
  sendRegisterOTP,
  verifyRegisterOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
