// order.controller.js - Xử lý request/response cho Orders
const orderService = require('./order.service');
const { success, created, error } = require('../../utils/apiResponse');

/**
 * Tạo đơn hàng COD (thanh toán khi nhận hàng)
 * POST /api/orders
 * @param {Object} req.body - { items, shippingInfo, subtotal, shippingFee, total }
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = {
      ...req.body,
      paymentMethod: 'COD',
    };

    const order = await orderService.createOrder(userId, orderData);
    return created(res, 'Đặt hàng thành công', { order });
  } catch (err) {
    console.error('[Orders] Lỗi tạo đơn hàng COD:', err);
    return error(res, 'Không thể tạo đơn hàng. Vui lòng thử lại.', 500);
  }
};

/**
 * Tạo đơn hàng VNPay + trả về URL thanh toán
 * POST /api/orders/vnpay/create-payment
 * @param {Object} req.body - { items, shippingInfo, subtotal, shippingFee, total }
 * @returns {Object} { paymentUrl, orderCode }
 */
const createVnpayPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = {
      ...req.body,
      paymentMethod: 'BANK', // Sử dụng BANK thay cho VNPAY để khớp với original schema
    };

    // 1. Tạo đơn hàng trong DB (trạng thái: chờ thanh toán)
    const order = await orderService.createOrder(userId, orderData);

    // 2. Lấy IP client (hỗ trợ cả proxy)
    let ipAddr =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      '127.0.0.1';

    // Chuẩn hóa IPv6 localhost về IPv4 để tránh lỗi VNPay
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
      ipAddr = '127.0.0.1';
    }

    // 3. Tạo URL thanh toán VNPay
    const paymentUrl = orderService.createVnpayPaymentUrl(order, ipAddr);

    return success(res, 'Tạo URL thanh toán VNPay thành công', {
      paymentUrl,
      orderCode: order.orderCode,
    });
  } catch (err) {
    console.error('[Orders] Lỗi tạo thanh toán VNPay:', err);
    return error(res, 'Không thể tạo thanh toán VNPay. Vui lòng thử lại.', 500);
  }
};

/**
 * Xác thực kết quả thanh toán VNPay (FE gọi sau khi VNPay redirect về)
 * GET /api/orders/vnpay/return?vnp_Amount=...&vnp_ResponseCode=00&...
 */
const vnpayReturn = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    const result = await orderService.verifyVnpayReturn(vnpParams);

    if (!result.isValid) {
      return error(res, 'Xác thực thanh toán thất bại', 400);
    }

    return success(res, 'Xác thực thanh toán thành công', {
      code: result.responseCode,
      order: result.order,
    });
  } catch (err) {
    console.error('[Orders] Lỗi xác thực VNPay return:', err);
    return error(res, 'Lỗi xác thực thanh toán', 500);
  }
};

/**
 * Xử lý IPN (Instant Payment Notification) từ VNPay
 * GET /api/orders/vnpay/ipn?vnp_...
 * Endpoint này VNPay gọi trực tiếp (server-to-server), không cần xác thực user
 */
const vnpayIPN = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    const result = await orderService.handleVnpayIPN(vnpParams);
    return res.status(200).json({ RspCode: result.rspCode, Message: result.message });
  } catch (err) {
    console.error('[Orders] Lỗi xử lý VNPay IPN:', err);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

/**
 * Lấy danh sách đơn hàng của user hiện tại
 * GET /api/orders
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getOrdersByUser(userId);
    return success(res, 'Lấy danh sách đơn hàng thành công', { orders });
  } catch (err) {
    console.error('[Orders] Lỗi lấy đơn hàng:', err);
    return error(res, 'Không thể lấy danh sách đơn hàng', 500);
  }
};

module.exports = {
  createOrder,
  createVnpayPayment,
  vnpayReturn,
  vnpayIPN,
  getMyOrders,
};
