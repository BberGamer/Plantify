// features/auth/auth.controller.js - Dieu phoi request & response cho module Auth
const authService = require("./auth.service");
const { success } = require("../../utils/apiResponse");

/**
 * Validate input co ban cho dang ky
 */
const validateRegisterInput = ({ fullName, email, password, phone }) => {
  if (!fullName || !fullName.trim()) {
    const err = new Error("Họ và tên là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  if (!email || !email.trim()) {
    const err = new Error("Địa chỉ email là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    const err = new Error("Địa chỉ email không đúng định dạng.");
    err.statusCode = 400;
    throw err;
  }

  if (!password || password.length < 8) {
    const err = new Error("Mật khẩu phải có tối thiểu 8 ký tự.");
    err.statusCode = 400;
    throw err;
  }

  if (phone && phone.trim() !== "") {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone.trim())) {
      const err = new Error("Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).");
      err.statusCode = 400;
      throw err;
    }
  }
};

/**
 * [POST] /register/send-otp
 */
const sendRegisterOTP = async (req, res, next) => {
  try {
    validateRegisterInput(req.body);
    await authService.sendRegisterOTP(req.body);
    return success(
      res,
      "Mã xác thực OTP đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.",
      null,
      200
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
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      const err = new Error("Email là bắt buộc.");
      err.statusCode = 400;
      throw err;
    }

    if (!otp || otp.toString().trim().length !== 6) {
      const err = new Error("Mã OTP không hợp lệ (phải gồm 6 chữ số).");
      err.statusCode = 400;
      throw err;
    }

    const result = await authService.verifyRegisterOTP(email, otp.toString().trim());
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
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Vui lòng nhập đầy đủ email và mật khẩu.");
      err.statusCode = 400;
      throw err;
    }

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
    const { email } = req.body;
    if (!email || !email.trim()) {
      const err = new Error("Email là bắt buộc.");
      err.statusCode = 400;
      throw err;
    }
    await authService.forgotPassword(email.trim());
    return success(
      res,
      "Mã xác thực đặt lại mật khẩu đã được gửi đến email của bạn.",
      null,
      200
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
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      const err = new Error("Vui lòng nhập đầy đủ email, mã OTP và mật khẩu mới.");
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 8) {
      const err = new Error("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      err.statusCode = 400;
      throw err;
    }

    await authService.resetPassword(email.trim(), otp.toString().trim(), newPassword);
    return success(
      res,
      "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.",
      null,
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRegisterOTP,
  verifyRegisterOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};