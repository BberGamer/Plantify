const validate = require("../validators/auth.validator");
const v = require("../validators/common");
// controllers/auth.controller.js - Dieu phoi request & response cho module Auth
const authService = require("../services/auth.service");
const { success } = require("../utils/api-response");

/**
 * [POST] /register/send-otp
 */
const sendRegisterOTP = async (req, res, next) => {
  try {
    await authService.sendRegisterOTP(validate.register(req.body));
    return success(
      res,
      "Mã xác thực đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.",
      null,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /register/verify-otp
 */
const verifyRegisterOTP = async (req, res, next) => {
  try {
    const { email, otp } = validate.verify(req.body);
    const result = await authService.verifyRegisterOTP(email, otp);
    return success(res, "Đăng ký tài khoản thành công!", result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = validate.login(req.body);
    const result = await authService.login(email, password);
    return success(res, "Đăng nhập thành công!", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /logout
 */
const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.user?.id);
    return success(res, "Đăng xuất thành công.", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, "Lấy thông tin tài khoản thành công.", user, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /forgot-password
 * Gui ma OTP quen mat khau ve email
 */
const forgotPassword = async (req, res, next) => {
  try {
    const email = v.email(v.object(req.body).email);
    await authService.forgotPassword(email);
    return success(
      res,
      "Mã xác thực đặt lại mật khẩu đã được gửi đến email của bạn.",
      null,
      200,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /reset-password
 * Dat lai mat khau bang ma OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = validate.reset(req.body);
    await authService.resetPassword(email, otp, newPassword);
    return success(
      res,
      "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.",
      null,
      200,
    );
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(
      req.user.id,
      validate.profile(req.body),
    );
    return success(res, "Đã lưu hồ sơ.", user);
  } catch (error) {
    next(error);
  }
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
