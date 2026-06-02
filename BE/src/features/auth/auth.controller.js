// auth.controller.js - Cầu nối điều phối giữa router và service
const authService = require('./auth.service');
const { success } = require('../../utils/apiResponse');

/**
 * Đăng ký tài khoản người dùng
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validate đầu vào ở boundary
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

    const user = await authService.register(req.body);
    return success(res, 'Đăng ký tài khoản thành công', user, 201);
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

    // Validate đầu vào
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
    // req.user được gán bởi middleware authenticate
    const user = await authService.getMe(req.user.id);
    return success(res, 'Lấy thông tin tài khoản thành công', user, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
