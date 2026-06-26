// order.service.js - Business logic cho Orders
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const Order = require('./order.model');

const SHIPPING_FEE = 30000;

function normalizeShippingInfo(shippingInfo = {}) {
  const fullName = (shippingInfo.fullName || '').trim();
  const phone = (shippingInfo.phone || '').trim();
  const email = (shippingInfo.email || '').trim().toLowerCase();
  const address = (shippingInfo.address || '').trim();
  const notes = (shippingInfo.notes || '').trim();

  if (!fullName || !phone || !email || !address) {
    const error = new Error('Vui lòng nhập đầy đủ thông tin giao hàng');
    error.statusCode = 400;
    throw error;
  }

  if (!/^\d{10,11}$/.test(phone.replace(/\s/g, ''))) {
    const error = new Error('Số điện thoại không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    const error = new Error('Email không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  return { fullName, phone, email, address, notes };
}

function generateOrderCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PL${datePart}${randomPart}`;
}

async function createUniqueOrderCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderCode = generateOrderCode();
    const exists = await Order.exists({ orderCode });
    if (!exists) return orderCode;
  }

  return `PL${Date.now()}`;
}

function toClientOrder(order) {
  return {
    id: String(order._id),
    orderCode: order.orderCode,
    items: order.items,
    shippingInfo: order.shippingInfo,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    createdAt: order.createdAt,
  };
}

async function getSelectedCartItems(userId) {
  const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price stock thumbnail images isActive');
  if (!cart) return { cart: null, selectedItems: [] };

  const selectedItems = cart.items.filter((item) => item.selected !== false && item.productId);
  return { cart, selectedItems };
}

async function createOrder(userId, orderData = {}) {
  const shippingInfo = normalizeShippingInfo(orderData.shippingInfo);
  const paymentMethod = orderData.paymentMethod === 'BANK' ? 'BANK' : 'COD';
  const { cart, selectedItems } = await getSelectedCartItems(userId);

  if (!cart || selectedItems.length === 0) {
    const error = new Error('Không có sản phẩm nào được chọn để đặt hàng');
    error.statusCode = 400;
    throw error;
  }

  const orderItems = selectedItems.map((item) => {
    const product = item.productId;

    if (!product || product.isActive === false) {
      const error = new Error('Một sản phẩm trong giỏ hàng không còn khả dụng');
      error.statusCode = 400;
      throw error;
    }

    if ((product.stock || 0) < item.quantity) {
      const error = new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
      error.statusCode = 400;
      throw error;
    }

    const price = product.price || 0;
    return {
      productId: product._id,
      name: product.name,
      image: product.thumbnail || product.images?.[0] || '',
      price,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
    };
  });

  for (const item of orderItems) {
    const updated = await Product.updateOne(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );

    if ((updated.modifiedCount ?? updated.nModified ?? 0) !== 1) {
      const error = new Error(`Sản phẩm "${item.name}" không đủ tồn kho`);
      error.statusCode = 400;
      throw error;
    }
  }

  const subtotal = orderItems.reduce((total, item) => total + item.lineTotal, 0);
  const shippingFee = SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const order = await Order.create({
    orderCode: await createUniqueOrderCode(),
    userId,
    items: orderItems,
    shippingInfo,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
    status: 'pending',
    subtotal,
    shippingFee,
    total,
  });

  cart.items = cart.items.filter((item) => item.selected === false);
  await cart.save();

  return toClientOrder(order);
}

async function getMyOrders(userId) {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return orders.map(toClientOrder);
}

module.exports = {
  createOrder,
  getMyOrders,
};
