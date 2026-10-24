const validate = require("../validators/auth.validator");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
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
  const { fullName, email, password, phone } = validate.register(userData);
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError(
      "EMAIL_IN_USE",
      400,
      "Email này đã được sử dụng bởi một tài khoản khác.",
    );
  }

  if (phone && phone.trim() !== "") {
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      throw new AppError(
        "PHONE_IN_USE",
        400,
        "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
      );
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
  ({ email, otp } = validate.verify({ email, otp }));
  const normalizedEmail = email.toLowerCase().trim();
  const pending = pendingRegistrations.get(normalizedEmail);

  if (!pending) {
    throw new AppError(
      "REGISTRATION_NOT_FOUND",
      404,
      "Không tìm thấy thông tin đăng ký cho email này hoặc đã hết hạn. Vui lòng đăng ký lại.",
    );
  }

  if (pending.expires < Date.now()) {
    pendingRegistrations.delete(normalizedEmail);
    throw new AppError(
      "OTP_EXPIRED",
      400,
      "Mã xác thực đã hết hạn (chỉ có hiệu lực trong 5 phút). Vui lòng yêu cầu mã mới.",
    );
  }

  const hashedInputOTP = crypto
    .createHash("sha256")
    .update(otp.trim())
    .digest("hex");
  if (pending.hashedOTP !== hashedInputOTP) {
    throw new AppError(
      "OTP_INVALID",
      400,
      "Mã xác thực không chính xác. Vui lòng kiểm tra lại.",
    );
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
  delete userObj.resetPasswordOTP;
  delete userObj.resetPasswordOTPExpires;

  return { user: userObj, token };
};

// === PHAN 2: DANG NHAP & DANG XUAT ===

const login = async (email, password) => {
  ({ email, password } = validate.login({ email, password }));
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      401,
      "Email chưa được đăng ký trong hệ thống.",
    );
  }

  if (!user.status) {
    throw new AppError(
      "ACCOUNT_LOCKED",
      403,
      "Tài khoản của bạn đã bị khóa hoặc tạm ngưng. Vui lòng liên hệ hỗ trợ.",
    );
  }

  if (user.isGoogleAccount && !user.password) {
    throw new AppError(
      "GOOGLE_ACCOUNT",
      400,
      "Tài khoản này được đăng ký bằng Google. Vui lòng chọn 'Tiếp tục với Google'.",
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      401,
      "Mật khẩu không chính xác. Vui lòng thử lại.",
    );
  }

  const token = generateJwtToken(user);
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordOTP;
  delete userObj.resetPasswordOTPExpires;

  return { user: userObj, token };
};

const logout = async (userId) => {
  return { message: "Đăng xuất thành công" };
};

const getMe = async (userId) => {
  v.id(userId);
  const user = await User.findById(userId).select(
    "-password -resetPasswordOTP -resetPasswordOTPExpires",
  );
  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      404,
      "Không tìm thấy thông tin người dùng.",
    );
  }
  return user;
};

// === PHAN 3: QUEN MAT KHAU & RESET PASSWORD CO OTP ===

/**
 * Gui OTP quen mat khau toi email
 * @param {string} email
 */
const forgotPassword = async (email) => {
  email = v.email(email);
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      404,
      "Không tìm thấy tài khoản với email này.",
    );
  }

  if (!user.status) {
    throw new AppError(
      "ACCOUNT_LOCKED",
      403,
      "Tài khoản đã bị khóa, không thể đặt lại mật khẩu.",
    );
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
  ({ email, otp, newPassword } = validate.reset({ email, otp, newPassword }));
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      404,
      "Không tìm thấy tài khoản với email này.",
    );
  }

  if (
    !user.resetPasswordOTPExpires ||
    user.resetPasswordOTPExpires < Date.now()
  ) {
    throw new AppError(
      "OTP_EXPIRED",
      400,
      "Mã xác thực đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.",
    );
  }

  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp.trim())
    .digest("hex");
  if (user.resetPasswordOTP !== hashedOTP) {
    throw new AppError("OTP_INVALID", 400, "Mã xác thực không chính xác.");
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
  v.id(userId);
  const { fullName, email, phone, currentPassword, newPassword } =
    validate.profile(input);
  const user = await User.findById(userId);
  if (!user)
    throw new AppError("USER_NOT_FOUND", 404, "Không tìm thấy tài khoản.");
  if (!user.status)
    throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
  // Email là định danh đăng nhập: yêu cầu mật khẩu hiện tại khi đổi email/mật khẩu.
  const normalizedEmail = email.trim().toLowerCase();
  const sensitiveChange =
    normalizedEmail !== user.email || newPassword !== undefined;
  if (sensitiveChange) {
    if (user.isGoogleAccount)
      throw new AppError(
        "GOOGLE_ACCOUNT",
        400,
        "Tài khoản Google không thể đổi email hoặc mật khẩu tại đây.",
      );
    if (
      typeof currentPassword !== "string" ||
      !currentPassword ||
      !(await bcrypt.compare(currentPassword, user.password))
    )
      throw new AppError(
        "CURRENT_PASSWORD_INVALID",
        400,
        "Mật khẩu hiện tại không chính xác.",
      );
  }
  const duplicate = await User.findOne({
    _id: { $ne: userId },
    $or: [
      { email: normalizedEmail },
      ...(phone.trim() ? [{ phone: phone.trim() }] : []),
    ],
  });
  if (duplicate)
    throw new AppError(
      "CONTACT_IN_USE",
      409,
      "Email hoặc số điện thoại đã được sử dụng.",
    );

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
    if (error.code === 11000)
      throw new AppError("EMAIL_IN_USE", 409, "Email đã được sử dụng.");
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
