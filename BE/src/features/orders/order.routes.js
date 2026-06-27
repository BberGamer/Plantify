// order.routes.js - Định nghĩa các route cho Orders
const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authenticate, authorizeBusinessManager, authorizeCustomer } = require('../../middlewares/auth');

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

// === QUẢN LÝ ĐƠN HÀNG (BUSINESS MANAGER) ===

// Lấy danh sách tất cả đơn hàng
router.get('/all', authenticate, authorizeBusinessManager, orderController.getAllOrders);

// Cập nhật trạng thái đơn hàng bởi business manager
router.put('/:id', authenticate, authorizeBusinessManager, orderController.updateOrder);

// === ĐƠN HÀNG CỦA TÔI (CUSTOMER) ===

// Lấy danh sách đơn hàng của user hiện tại
router.get('/', authenticate, orderController.getMyOrders);

// Khách hàng xác nhận nhận hàng hoặc yêu cầu hoàn trả (chỉ khi status = 'sented')
router.put('/:id/customer-action', authenticate, authorizeCustomer, orderController.customerAction);

module.exports = router;

