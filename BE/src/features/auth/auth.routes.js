// auth.routes.js - Định nghĩa các API endpoint cho xác thực
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth');

// Đăng ký người dùng mới
router.post('/register', authController.register);

// Đăng nhập người dùng
router.post('/login', authController.login);

// Lấy thông tin người dùng hiện hành qua token
router.get('/me', authenticate, authController.getMe);

module.exports = router;
