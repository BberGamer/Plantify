// order.service.js - Business logic cho Orders (đặt hàng + thanh toán VNPay)
const crypto = require('crypto');
const qs = require('qs');
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const { createOrderNotification } = require('../notifications/notification.service');

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

function normalizeOrderQuantity(quantity) {
  const normalized = Number(quantity);
  if (!Number.isFinite(normalized) || normalized < 1) {
    return 1;
  }
  return Math.floor(normalized);
}

async function buildOrderItemsFromProducts(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Đơn hàng phải có ít nhất một sản phẩm');
  }

  const requestedItems = items.map((item) => ({
    productId: item.productId || item.id,
    quantity: normalizeOrderQuantity(item.quantity),
  }));
  const productIds = requestedItems.map((item) => item.productId).filter(Boolean);

  if (productIds.length !== requestedItems.length) {
    throw new Error('Sản phẩm trong đơn hàng không hợp lệ');
  }

  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  return requestedItems.map((item) => {
    const product = productMap.get(String(item.productId));

    if (!product || product.isActive === false) {
      throw new Error('Sản phẩm không tồn tại hoặc đã ngừng bán');
    }

    if ((product.stock || 0) < item.quantity) {
      throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock || 0} sản phẩm`);
    }

    const price = Number(product.price || 0);

    return {
      productId: product._id,
      name: product.name,
      image: product.thumbnail || product.images?.[0] || '',
      price,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
    };
  });
}

async function applyOrderInventory(order) {
  if (!order || order.inventoryApplied) {
    return;
  }

  for (const item of order.items) {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.quantity },
      },
      {
        $inc: {
          stock: -item.quantity,
          soldCount: item.quantity,
        },
      },
      { new: true }
    );

    if (!updatedProduct) {
      throw new Error(`Sản phẩm "${item.name}" không đủ tồn kho để hoàn tất đơn hàng`);
    }
  }

  order.inventoryApplied = true;
}

// ========== SERVICE FUNCTIONS ==========

/**
 * Tạo đơn hàng mới (dùng cho cả COD và VNPay)
 * - COD: status = 'pending' (chờ xử lý/xác nhận)
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

  // COD và BANK: mặc định đơn hàng mới đều có status = 'pending'
  if (orderData.paymentMethod === 'COD') {
    order.status = 'pending';

    // Tự động xóa các sản phẩm đã được chọn mua khỏi giỏ hàng của user
    await Cart.updateOne(
      { userId },
      { $pull: { items: { selected: true } } }
    ).catch((err) => console.error('[Order Service] Lỗi khi xóa sản phẩm giỏ hàng COD:', err));
  }

  await order.save();
  return order;
}

async function createOrderFromProducts(userId, orderData) {
  const orderCode = generateOrderCode();
  const mappedItems = await buildOrderItemsFromProducts(orderData.items);
  const subtotal = mappedItems.reduce((total, item) => total + item.lineTotal, 0);
  const shippingFee = Number(orderData.shippingFee ?? 30000);

  const order = new Order({
    userId,
    orderCode,
    items: mappedItems,
    shippingInfo: orderData.shippingInfo,
    paymentMethod: orderData.paymentMethod,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
  });

  if (orderData.paymentMethod === 'COD') {
    order.status = 'pending';
    await order.validate();
    await applyOrderInventory(order);

    await Cart.updateOne(
      { userId },
      { $pull: { items: { selected: true } } }
    ).catch((err) => console.error('[Order Service] Loi khi xoa san pham gio hang COD:', err));
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

  // Clone vnpParams tránh side-effect biến gốc
  const params = { ...vnpParams };

  // 1. Xóa các trường hash trước khi verify (theo tài liệu VNPay)
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];

  // 2. Sắp xếp và tạo chữ ký để so sánh
  const sortedParams = sortObject(params);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  // 3. So sánh chữ ký - nếu khác nhau nghĩa là dữ liệu đã bị thay đổi
  if (secureHash !== signed) {
    return { isValid: false, responseCode: '97', order: null };
  }

  // 4. Tìm đơn hàng theo mã TxnRef (chính là orderCode)
  const orderCode = params['vnp_TxnRef'];
  const responseCode = params['vnp_ResponseCode'];
  const order = await Order.findOne({ orderCode });

  if (!order) {
    if (responseCode !== '00') {
      return { isValid: true, responseCode, order: null };
    }
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
    order.status = 'pending';
    order.vnpayTransactionNo = params['vnp_TransactionNo'] || null;
    order.paidAt = new Date();
    await applyOrderInventory(order);

    // Tự động xóa sản phẩm đã mua khỏi giỏ hàng
    await Cart.updateOne(
      { userId: order.userId },
      { $pull: { items: { selected: true } } }
    ).catch((err) => console.error('[Order Service] Lỗi khi xóa sản phẩm giỏ hàng sau thanh toán:', err));

    await order.save();
  } else {
    // Thanh toán thất bại hoặc bị hủy -> Xóa đơn hàng khỏi DB để không lưu vết
    await Order.deleteOne({ orderCode });
    return { isValid: true, responseCode, order: null };
  }

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

  // Clone vnpParams tránh side-effect biến gốc
  const params = { ...vnpParams };

  const orderId = params['vnp_TxnRef'];
  const rspCode = params['vnp_ResponseCode'];

  // 1. Xóa hash fields trước khi verify
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];

  // 2. Verify checksum
  const sortedParams = sortObject(params);
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
    order.status = 'pending';
    order.vnpayTransactionNo = vnpParams['vnp_TransactionNo'] || null;
    order.paidAt = new Date();
    await applyOrderInventory(order);

    // Tự động xóa sản phẩm đã mua khỏi giỏ hàng
    await Cart.updateOne(
      { userId: order.userId },
      { $pull: { items: { selected: true } } }
    ).catch((err) => console.error('[Order Service] Lỗi khi xóa sản phẩm giỏ hàng trong IPN:', err));

    await order.save();
  } else {
    // Thanh toán thất bại hoặc bị hủy -> Xóa đơn hàng khỏi DB
    await Order.deleteOne({ orderCode: orderId });
  }

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

/**
 * Lấy thống kê dashboard cho business manager
 * @returns {Object} { totalRevenue, monthlyRevenue, year }
 */
async function getDashboardStats() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthlyRevenue = Array.from({ length: currentMonth + 1 }, (_, index) => ({
    month: `T${index + 1}`,
    revenue: 0,
  }));

  const paidOrders = await Order.find({
    paymentStatus: 'paid',
    paidAt: { $ne: null },
  })
    .select('total paidAt')
    .lean();

  const totalRevenue = paidOrders.reduce((sum, order) => {
    const orderTotal = Number(order.total || 0);
    const paidDate = new Date(order.paidAt);

    if (paidDate.getFullYear() === currentYear && paidDate.getMonth() <= currentMonth) {
      monthlyRevenue[paidDate.getMonth()].revenue += orderTotal;
    }

    return sum + orderTotal;
  }, 0);

  return {
    totalRevenue,
    monthlyRevenue,
    year: currentYear,
  };
}

/**
 * Lấy danh sách tất cả đơn hàng (cho quản lý)
 * @returns {Array} Danh sách đơn hàng
 */
async function getAllOrders() {
  return Order.find({}).sort({ createdAt: -1 });
}

/**
 * Map các chuyển đổi trạng thái được phép theo role
 * - businessManager: pending → packing, packing → sented, returning → cancelled, pending → cancelled
 * - customer: sented → succeeded, sented → returning
 */
const ALLOWED_TRANSITIONS_BM = {
  pending: ['packing', 'cancelled'],
  packing: ['sented'],
  returning: ['cancelled'],
};

const ALLOWED_TRANSITIONS_CUSTOMER = {
  sented: ['succeeded', 'returning'],
};

/**
 * Cập nhật trạng thái đơn hàng bởi Business Manager
 * Kiểm tra chuyển đổi hợp lệ, xử lý logic đặc biệt khi hủy đơn
 * @param {string} orderId - ID đơn hàng
 * @param {Object} updateData - { status }
 * @returns {Object} Đơn hàng sau cập nhật
 * @throws {Error} Nếu trạng thái chuyển đổi không hợp lệ
 */
async function updateOrder(orderId, updateData, actorId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Không tìm thấy đơn hàng');
  }

  if (updateData.status) {
    const allowedNext = ALLOWED_TRANSITIONS_BM[order.status] || [];
    if (!allowedNext.includes(updateData.status)) {
      throw new Error(
        `Không thể chuyển từ "${order.status}" sang "${updateData.status}"`
      );
    }

    order.status = updateData.status;

    // Khi hủy đơn: ghi lại thời điểm hủy
    if (updateData.status === 'cancelled') {
      order.cancelledAt = new Date();
    }
  }

  if (updateData.paymentStatus) {
    order.paymentStatus = updateData.paymentStatus;
    if (updateData.paymentStatus === 'paid' && !order.paidAt) {
      order.paidAt = new Date();
    }
  }

  await order.save();

  // Tạo thông báo cho user khi trạng thái đơn hàng thay đổi
  if (updateData.status && actorId) {
    createOrderNotification(order, updateData.status, actorId)
      .catch((err) => console.error('[Order Service] Lỗi tạo thông báo đơn hàng:', err));
  }

  return order;
}

/**
 * Xử lý hành động của khách hàng trên đơn hàng (chỉ khi status = 'sented')
 * - succeeded: khách xác nhận đã nhận hàng → COD tự động đánh dấu paid
 * - returning: khách yêu cầu hoàn trả hàng
 * @param {string} orderId - ID đơn hàng
 * @param {string} userId - ID khách hàng (kiểm tra chủ đơn)
 * @param {string} action - 'succeeded' | 'returning'
 * @returns {Object} Đơn hàng sau cập nhật
 * @throws {Error} Nếu hành động không hợp lệ hoặc không đúng chủ đơn
 */
async function customerActionOrder(orderId, userId, action) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Không tìm thấy đơn hàng');
  }

  // Bảo mật: chỉ cho phép chủ đơn hàng thao tác
  if (order.userId.toString() !== userId.toString()) {
    throw new Error('Bạn không có quyền thao tác đơn hàng này');
  }

  const allowedNext = ALLOWED_TRANSITIONS_CUSTOMER[order.status] || [];
  if (!allowedNext.includes(action)) {
    throw new Error(
      `Không thể thực hiện hành động "${action}" khi đơn hàng đang ở trạng thái "${order.status}"`
    );
  }

  order.status = action;

  // Nếu nhận hàng thành công và thanh toán COD → đánh dấu đã thanh toán
  if (action === 'succeeded' && order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
  }

  await order.save();
  return order;
}

module.exports = {
  createOrder: createOrderFromProducts,
  createVnpayPaymentUrl,
  verifyVnpayReturn,
  handleVnpayIPN,
  getOrdersByUser,
  getDashboardStats,
  getAllOrders,
  updateOrder,
  customerActionOrder,
};

