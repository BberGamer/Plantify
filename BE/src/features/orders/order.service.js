// order.service.js - Business logic cho Orders (đặt hàng + thanh toán VNPay)
const crypto = require('crypto');
const qs = require('qs');
const Order = require('./order.model');
const Cart = require('../cart/cart.model');

// ========== HELPER FUNCTIONS ==========

/**
 * Tạo mã đơn hàng duy nhất
 * Format: PL + YYYYMMDDHHmmss + 3 ký tự random
 * @returns {string} Mã đơn hàng, ví dụ: PL20260626230407X2K
 */
function generateOrderCode() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PL${dateStr}${randomStr}`;
}

/**
 * Format ngày theo định dạng YYYYMMDDHHmmss (yêu cầu bắt buộc của VNPay)
 * @param {Date} date - Đối tượng Date
 * @returns {string} Chuỗi ngày đã format, ví dụ: 20260626230407
 */
function formatVnpayDate(date) {
  const gmt7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return [
    gmt7Date.getUTCFullYear(),
    pad(gmt7Date.getUTCMonth() + 1),
    pad(gmt7Date.getUTCDate()),
    pad(gmt7Date.getUTCHours()),
    pad(gmt7Date.getUTCMinutes()),
    pad(gmt7Date.getUTCSeconds()),
  ].join('');
}

/**
 * Sắp xếp object theo key và encode giá trị (yêu cầu của VNPay khi tạo checksum)
 * Logic giống hệt demo vnpay_nodejs: encode key + encode value + sort
 * @param {Object} obj - Object cần sắp xếp
 * @returns {Object} Object đã sắp xếp với key/value đã encode
 */
function sortObject(obj) {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
  }
  return sorted;
}

// ========== SERVICE FUNCTIONS ==========

/**
 * Tạo đơn hàng mới (dùng cho cả COD và VNPay)
 * - COD: status = 'confirmed' (xác nhận ngay)
 * - BANK: status = 'pending' (chờ thanh toán)
 * @param {string} userId - ID người dùng từ JWT token
 * @param {Object} orderData - { items, shippingInfo, paymentMethod, subtotal, shippingFee, total }
 * @returns {Object} Đơn hàng đã tạo trong DB
 */
async function createOrder(userId, orderData) {
  const orderCode = generateOrderCode();

  // Map items sang đúng schema (có lineTotal và image)
  const mappedItems = orderData.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    image: item.image || item.thumbnail || '',
    price: item.price,
    quantity: item.quantity,
    lineTotal: item.lineTotal ?? (item.price * item.quantity),
  }));

  const order = new Order({
    userId,
    orderCode,
    items: mappedItems,
    shippingInfo: orderData.shippingInfo,
    paymentMethod: orderData.paymentMethod, // 'COD' hoặc 'BANK'
    subtotal: orderData.subtotal,
    shippingFee: orderData.shippingFee ?? 30000,
    total: orderData.total ?? orderData.totalAmount,
  });

  // COD: xác nhận đơn ngay, BANK: chờ thanh toán thành công mới xác nhận
  if (orderData.paymentMethod === 'COD') {
    order.status = 'confirmed';
    
    // Tự động xóa các sản phẩm đã được chọn mua khỏi giỏ hàng của user
    await Cart.updateOne(
      { userId },
      { $pull: { items: { selected: true } } }
    ).catch((err) => console.error('[Order Service] Lỗi khi xóa sản phẩm giỏ hàng COD:', err));
  }

  await order.save();
  return order;
}

/**
 * Tạo URL thanh toán VNPay từ đơn hàng đã lưu
 * Quy trình: build params → sort → HMAC SHA512 → tạo URL hoàn chỉnh
 * @param {Object} order - Đơn hàng đã lưu trong DB
 * @param {string} ipAddr - Địa chỉ IP của khách hàng
 * @returns {string} URL thanh toán VNPay hoàn chỉnh
 */
function createVnpayPaymentUrl(order, ipAddr) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  const date = new Date();
  const createDate = formatVnpayDate(date);
  
  // vnp_ExpireDate is 15 minutes after create date
  const expireDateObj = new Date(date.getTime() + 15 * 60 * 1000);
  const expireDate = formatVnpayDate(expireDateObj);

  // 1. Xây dựng tham số thanh toán theo tài liệu VNPay
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = order.orderCode;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + order.orderCode;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = order.total * 100; // VNPay yêu cầu nhân 100
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;

  // 2. Sắp xếp tham số theo key (bắt buộc để tạo checksum đúng)
  vnp_Params = sortObject(vnp_Params);

  // 3. Tạo chữ ký HMAC SHA512 (Sử dụng encode: false để ký dữ liệu thô)
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  console.log('[VNPay URL Builder] Inputs:', {
    orderCode: order.orderCode,
    total: order.total,
    ipAddr
  });
  console.log('[VNPay URL Builder] signData:', signData);
  console.log('[VNPay URL Builder] secureHash:', signed);

  vnp_Params['vnp_SecureHash'] = signed;

  // 4. Ghép URL thanh toán hoàn chỉnh (Sử dụng encode: false để tránh double-encoding các giá trị đã encode ở sortObject)
  const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

  console.log('[VNPay URL Builder] Generated URL:', paymentUrl);

  return paymentUrl;
}

/**
 * Xác thực kết quả thanh toán VNPay (khi user được redirect về FE)
 * Quy trình: verify checksum → tìm order → cập nhật trạng thái
 * @param {Object} vnpParams - Toàn bộ query params VNPay trả về
 * @returns {Object} { isValid, responseCode, order }
 */
async function verifyVnpayReturn(vnpParams) {
  const secureHash = vnpParams['vnp_SecureHash'];
  const secretKey = process.env.VNPAY_HASH_SECRET;

  // 1. Xóa các trường hash trước khi verify (theo tài liệu VNPay)
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  // 2. Sắp xếp và tạo chữ ký để so sánh
  const sortedParams = sortObject(vnpParams);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  // 3. So sánh chữ ký - nếu khác nhau nghĩa là dữ liệu đã bị thay đổi
  if (secureHash !== signed) {
    return { isValid: false, responseCode: '97', order: null };
  }

  // 4. Tìm đơn hàng theo mã TxnRef (chính là orderCode)
  const orderCode = vnpParams['vnp_TxnRef'];
  const responseCode = vnpParams['vnp_ResponseCode'];
  const order = await Order.findOne({ orderCode });

  if (!order) {
    return { isValid: false, responseCode: '01', order: null };
  }

  // 5. Nếu đơn đã thanh toán rồi thì trả về luôn (tránh xử lý trùng)
  if (order.paymentStatus === 'paid') {
    return { isValid: true, responseCode: '00', order };
  }

  // 6. Cập nhật trạng thái đơn hàng theo kết quả từ VNPay
  if (responseCode === '00') {
    // Thanh toán thành công
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.vnpayTransactionNo = vnpParams['vnp_TransactionNo'] || null;
    order.paidAt = new Date();

    // Tự động xóa sản phẩm đã mua khỏi giỏ hàng
    await Cart.updateOne(
      { userId: order.userId },
      { $pull: { items: { selected: true } } }
    ).catch((err) => console.error('[Order Service] Lỗi khi xóa sản phẩm giỏ hàng sau thanh toán:', err));
  } else {
    // Thanh toán thất bại hoặc bị hủy
    order.paymentStatus = 'failed';
    order.status = 'cancelled';
  }

  await order.save();

  return { isValid: true, responseCode, order };
}

/**
 * Xử lý IPN (Instant Payment Notification) - VNPay gọi server-to-server
 * Endpoint này không cần xác thực user vì VNPay gọi trực tiếp
 * @param {Object} vnpParams - Tham số VNPay gửi qua IPN
 * @returns {Object} { rspCode, message } theo format VNPay yêu cầu
 */
async function handleVnpayIPN(vnpParams) {
  const secureHash = vnpParams['vnp_SecureHash'];
  const secretKey = process.env.VNPAY_HASH_SECRET;

  const orderId = vnpParams['vnp_TxnRef'];
  const rspCode = vnpParams['vnp_ResponseCode'];

  // 1. Xóa hash fields trước khi verify
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  // 2. Verify checksum
  const sortedParams = sortObject(vnpParams);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash !== signed) {
    return { rspCode: '97', message: 'Checksum failed' };
  }

  // 3. Tìm đơn hàng
  const order = await Order.findOne({ orderCode: orderId });
  if (!order) {
    return { rspCode: '01', message: 'Order not found' };
  }

  // 4. Kiểm tra số tiền có khớp không
  const vnpAmount = parseInt(vnpParams['vnp_Amount']) / 100;
  if (vnpAmount !== order.total) {
    return { rspCode: '04', message: 'Amount invalid' };
  }

  // 5. Kiểm tra đơn đã xử lý chưa
  if (order.paymentStatus !== 'pending') {
    return { rspCode: '02', message: 'Order already updated' };
  }

  // 6. Cập nhật trạng thái
  if (rspCode === '00') {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.vnpayTransactionNo = vnpParams['vnp_TransactionNo'] || null;
    order.paidAt = new Date();

    // Tự động xóa sản phẩm đã mua khỏi giỏ hàng
    await Cart.updateOne(
      { userId: order.userId },
      { $pull: { items: { selected: true } } }
    ).catch((err) => console.error('[Order Service] Lỗi khi xóa sản phẩm giỏ hàng trong IPN:', err));
  } else {
    order.paymentStatus = 'failed';
    order.status = 'cancelled';
  }

  await order.save();
  return { rspCode: '00', message: 'Success' };
}

/**
 * Lấy danh sách đơn hàng của user (sắp xếp mới nhất lên đầu)
 * @param {string} userId - ID người dùng
 * @returns {Array} Danh sách đơn hàng
 */
async function getOrdersByUser(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 });
}

module.exports = {
  createOrder,
  createVnpayPaymentUrl,
  verifyVnpayReturn,
  handleVnpayIPN,
  getOrdersByUser,
};
