// api.js - Các hàm gọi API cho chức năng đặt hàng (Orders)
import { api } from '@/lib/api';

/**
 * Tạo đơn hàng COD (thanh toán khi nhận hàng)
 * @param {Object} orderData - { items, shippingInfo, subtotal, shippingFee, totalAmount }
 * @returns {Promise} Response chứa thông tin đơn hàng đã tạo
 */
export const createOrder = (orderData) => {
  return api.post('/orders', orderData);
};

/**
 * Tạo đơn hàng VNPay + lấy URL thanh toán
 * @param {Object} orderData - { items, shippingInfo, subtotal, shippingFee, totalAmount }
 * @returns {Promise} Response chứa { paymentUrl, orderCode }
 */
export const createVnpayPayment = (orderData) => {
  return api.post('/orders/vnpay/create-payment', orderData);
};

/**
 * Xác thực kết quả thanh toán VNPay (gửi query params từ VNPay redirect)
 * @param {Object} params - Object chứa tất cả vnp_ params từ URL
 * @returns {Promise} Response chứa { code, order }
 */
export const verifyVnpayPayment = (params) => {
  return api.get('/orders/vnpay/return', { params });
};

/**
 * Lấy danh sách đơn hàng của user hiện tại
 * @returns {Promise} Response chứa danh sách đơn hàng
 */
export const getMyOrders = () => {
  return api.get('/orders');
};

/**
 * Lấy thống kê dashboard cho business manager
 * @returns {Promise}
 */
export const getDashboardStats = () => {
  return api.get('/orders/stats/dashboard');
};

/**
 * Lấy danh sách tất cả đơn hàng (cho business manager)
 * @returns {Promise}
 */
export const getAllOrders = () => {
  return api.get('/orders/all');
};

/**
 * Cập nhật đơn hàng bởi business manager (trạng thái)
 * @param {string} orderId
 * @param {Object} updateData - { status }
 * @returns {Promise}
 */
export const updateOrder = (orderId, updateData) => {
  return api.put(`/orders/${orderId}`, updateData);
};

/**
 * Khách hàng thực hiện hành động trên đơn hàng (chỉ khi status = 'sented')
 * @param {string} orderId - ID đơn hàng
 * @param {string} action - 'succeeded' (nhận hàng) | 'returning' (yêu cầu hoàn trả)
 * @returns {Promise}
 */
export const customerUpdateOrder = (orderId, action) => {
  return api.put(`/orders/${orderId}/customer-action`, { action });
};

