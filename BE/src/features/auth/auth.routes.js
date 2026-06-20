// auth.routes.js - Định nghĩa các API endpoint cho xác thực
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate, authorizeAdmin } = require('../../middlewares/auth');

// Đăng ký người dùng mới (dùng cho admin tạo user trực tiếp)
router.post('/register', authController.register);

// Bước 1: Gửi OTP xác thực email khi đăng ký
router.post('/register/send-otp', authController.sendRegisterOTP);

// Bước 2: Xác thực OTP và kích hoạt tài khoản
router.post('/register/verify-otp', authController.verifyRegisterOTP);

// Đăng nhập người dùng
router.post('/login', authController.login);

// Lấy thông tin người dùng hiện hành qua token
router.get('/me', authenticate, authController.getMe);

// Lấy danh sách người dùng cho quản trị viên
router.get('/users', authenticate, authorizeAdmin, authController.getUsers);

// Tạo người dùng mới cho quản trị viên
router.post('/users', authenticate, authorizeAdmin, authController.createUserByAdmin);

// Cập nhật trạng thái người dùng cho quản trị viên
router.patch('/users/:id/status', authenticate, authorizeAdmin, authController.updateUserStatus);

// Xóa người dùng cho quản trị viên
router.delete('/users/:id', authenticate, authorizeAdmin, authController.deleteUser);

// Quên mật khẩu - gửi OTP qua email
router.post('/forgot-password', authController.forgotPassword);

// Xác thực mã OTP (bước trung gian trước khi đặt lại mật khẩu)
router.post('/verify-otp', authController.verifyOTP);

// Đặt lại mật khẩu bằng OTP từ email
router.post('/reset-password', authController.resetPassword);

// Cập nhật thông tin cá nhân của người dùng đang đăng nhập
router.patch('/me', authenticate, authController.updateProfile);

// Đổi mật khẩu của người dùng đang đăng nhập
router.patch('/me/password', authenticate, authController.changePassword);

module.exports = router;
