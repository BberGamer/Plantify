// auth.controller.js - Cầu nối điều phối giữa router và service
const authService = require('./auth.service');
const { success } = require('../../utils/apiResponse');

const ADMIN_CREATABLE_ROLES = ['business manager', 'content manager'];

const validateUserInput = ({ fullName, email, password, phone }) => {
  if (!fullName || !email || !password) {
    const err = new Error('Họ tên, email và mật khẩu là bắt buộc');
    err.statusCode = 400;
    throw err;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const err = new Error('Email không đúng định dạng');
    err.statusCode = 400;
    throw err;
  }

  if (phone && phone.trim() !== '') {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone.trim())) {
      const err = new Error('Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 chữ số)');
      err.statusCode = 400;
      throw err;
    }
  }

  if (password.length < 8) {
    const err = new Error('Mật khẩu phải có tối thiểu 8 ký tự');
    err.statusCode = 400;
    throw err;
  }
};

/**
 * Đăng ký tài khoản người dùng
 */
const register = async (req, res, next) => {
  try {
    validateUserInput(req.body);
    const user = await authService.register(req.body);
    return success(res, 'Đăng ký tài khoản thành công', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo tài khoản người dùng bởi quản trị viên
 */
const createUserByAdmin = async (req, res, next) => {
  try {
    validateUserInput(req.body);

    if (!ADMIN_CREATABLE_ROLES.includes(req.body.role)) {
      const err = new Error('Vai trò không hợp lệ');
      err.statusCode = 400;
      throw err;
    }

    const user = await authService.createUserByAdmin(req.body);
    return success(res, 'Tạo tài khoản người dùng thành công', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng nhập tài khoản người dùng
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email và mật khẩu là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error('Email không đúng định dạng');
      err.statusCode = 400;
      throw err;
    }

    const data = await authService.login(email, password);
    return success(res, 'Đăng nhập thành công', data, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin tài khoản hiện tại (Me)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, 'Lấy thông tin tài khoản thành công', user, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách người dùng cho quản trị viên
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await authService.getUsers();
    return success(res, 'Lấy danh sách người dùng thành công', users, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật trạng thái tài khoản người dùng
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      const err = new Error('Trạng thái không hợp lệ');
      err.statusCode = 400;
      throw err;
    }

    const user = await authService.updateUserStatus(req.params.id, status);
    return success(res, 'Cập nhật trạng thái người dùng thành công', user, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Quên mật khẩu - gửi email đặt lại
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const err = new Error('Email không đúng định dạng');
      err.statusCode = 400;
      throw err;
    }

    await authService.forgotPassword(email.trim());
    return success(res, 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Đặt lại mật khẩu bằng OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    if (!otp || !otp.trim() || otp.trim().length !== 6) {
      const err = new Error('Mã OTP không hợp lệ (phải gồm 6 chữ số)');
      err.statusCode = 400;
      throw err;
    }

    if (!password || !confirmPassword) {
      const err = new Error('Mật khẩu và xác nhận mật khẩu là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    if (password !== confirmPassword) {
      const err = new Error('Mật khẩu xác nhận không khớp');
      err.statusCode = 400;
      throw err;
    }

    if (password.length < 8) {
      const err = new Error('Mật khẩu phải có tối thiểu 8 ký tự');
      err.statusCode = 400;
      throw err;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      const err = new Error('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      err.statusCode = 400;
      throw err;
    }

    await authService.resetPassword(email.trim(), otp.trim(), password);
    return success(res, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Xác thực mã OTP (không đặt lại mật khẩu)
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    if (!otp || otp.trim().length !== 6) {
      const err = new Error('Mã OTP không hợp lệ (phải gồm 6 chữ số)');
      err.statusCode = 400;
      throw err;
    }

    await authService.verifyOTP(email.trim(), otp.trim());
    return success(res, 'Mã OTP hợp lệ. Bạn có thể đặt lại mật khẩu.', null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  createUserByAdmin,
  login,
  getMe,
  getUsers,
  updateUserStatus,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
