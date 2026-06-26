// order.routes.js - Định nghĩa các route cho Orders
const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authenticate } = require('../../middlewares/auth');

// === ĐẶT HÀNG ===

// Tạo đơn hàng COD (yêu cầu đăng nhập)
router.post('/', authenticate, orderController.createOrder);

// Tạo đơn hàng VNPay + lấy URL thanh toán (yêu cầu đăng nhập)
router.post('/vnpay/create-payment', authenticate, orderController.createVnpayPayment);

// === VNPAY CALLBACK ===

// Xác thực kết quả thanh toán (FE gọi sau khi VNPay redirect về)
router.get('/vnpay/return', authenticate, orderController.vnpayReturn);

// IPN callback - VNPay gọi trực tiếp server-to-server (KHÔNG cần auth)
router.get('/vnpay/ipn', orderController.vnpayIPN);

// === QUẢN LÝ ĐƠN HÀNG ===

// Lấy danh sách đơn hàng của user hiện tại
router.get('/', authenticate, orderController.getMyOrders);

module.exports = router;
