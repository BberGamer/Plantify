// cart.service.js - Business logic cho Cart
const mongoose = require('mongoose');
const Cart = require('./cart.model');
const Product = require('../products/product.model');

function ensureObjectId(id, message = 'ID không hợp lệ') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

/** Chuẩn hóa quantity thành số nguyên dương. @param {*} quantity - Số lượng đầu vào. @returns {number} Quantity hợp lệ. */
function normalizeQuantity(quantity) {
  const normalized = Number(quantity);
  if (!Number.isFinite(normalized) || normalized < 1) return 1;
  return Math.floor(normalized);
}

/** Lấy hoặc tạo giỏ hàng cho người dùng. @param {string} userId - ID người dùng. @returns {Promise<Object>} Cart document. */
async function getOrCreateCart(userId) {
  ensureObjectId(userId, 'User ID không hợp lệ');

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
}

/** Map cart item đã populate sang shape trả cho client. @param {Object} item - Cart item. @returns {Object} Item phía client. */
function toClientItem(item) {
  const product = item.productId;
  const productId = product?._id || product;

  return {
    id: String(productId),
    productId: String(productId),
    name: product?.name || 'Sản phẩm',
    price: product?.price || 0,
    quantity: item.quantity,
    stock: product?.stock || 0,
    image: product?.thumbnail || product?.images?.[0] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    shop: product?.brand || 'Plantify Shop',
    selected: item.selected !== false,
  };
}

async function populateCart(cart) {
  return cart.populate('items.productId', 'name price stock thumbnail images brand isActive');
}

/** Lấy giỏ hàng đã populate và tính tổng. @param {string} userId - ID người dùng. @returns {Promise<Object>} Payload giỏ hàng. */
async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  await populateCart(cart);

  const items = cart.items
    .filter((item) => item.productId && item.productId.isActive !== false)
    .map(toClientItem);

  return {
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
  };
}

/** Thêm hoặc cộng số lượng sản phẩm, không vượt tồn kho. @param {string} userId - ID người dùng. @param {string} productId - ID sản phẩm. @param {number} [quantity=1] - Số lượng thêm. @param {boolean} [selected=true] - Trạng thái chọn. @returns {Promise<Object>} Giỏ hàng sau cập nhật. */
async function addItem(userId, productId, quantity = 1, selected = true) {
  ensureObjectId(productId, 'Product ID không hợp lệ');

  const product = await Product.findById(productId);
  if (!product || product.isActive === false) {
    const error = new Error('Không tìm thấy sản phẩm');
    error.statusCode = 404;
    throw error;
  }

  if ((product.stock || 0) < 1) {
    const error = new Error('Sản phẩm đã hết hàng');
    error.statusCode = 400;
    throw error;
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => String(item.productId) === String(productId));
  const requestedQuantity = normalizeQuantity(quantity);

  if (existingItem) {
    existingItem.quantity = Math.min(product.stock || requestedQuantity, existingItem.quantity + requestedQuantity);
    existingItem.selected = selected;
  } else {
    cart.items.push({
      productId,
      quantity: Math.min(product.stock || requestedQuantity, requestedQuantity),
      selected,
    });
  }

  await cart.save();
  return getCart(userId);
}

/** Hợp nhất các item local vào giỏ tài khoản. @param {string} userId - ID người dùng. @param {Array} [items=[]] - Item cục bộ. @returns {Promise<Object>} Giỏ hàng sau hợp nhất. */
async function mergeItems(userId, items = []) {
  if (!Array.isArray(items)) {
    const error = new Error('Danh sách giỏ hàng không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  for (const item of items) {
    const productId = item.productId || item.id;
    if (!productId) continue;
    await addItem(userId, productId, item.quantity, item.selected !== false);
  }

  return getCart(userId);
}

/** Cập nhật quantity hoặc selected của cart item. @param {string} userId - ID người dùng. @param {string} productId - ID sản phẩm. @param {Object} [data={}] - Dữ liệu cập nhật. @returns {Promise<Object>} Giỏ hàng sau cập nhật. */
async function updateItem(userId, productId, data = {}) {
  ensureObjectId(productId, 'Product ID không hợp lệ');

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((cartItem) => String(cartItem.productId) === String(productId));
  if (!item) {
    const error = new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    error.statusCode = 404;
    throw error;
  }

  if (data.quantity !== undefined) {
    const product = await Product.findById(productId);
    const stock = product?.stock || 1;
    item.quantity = Math.min(stock, normalizeQuantity(data.quantity));
  }

  if (data.selected !== undefined) {
    item.selected = data.selected === true;
  }

  await cart.save();
  return getCart(userId);
}

/** Xóa sản phẩm khỏi giỏ. @param {string} userId - ID người dùng. @param {string} productId - ID sản phẩm. @returns {Promise<Object>} Giỏ hàng sau xóa. */
async function removeItem(userId, productId) {
  ensureObjectId(productId, 'Product ID không hợp lệ');

  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));
  await cart.save();

  return getCart(userId);
}

/** Xóa toàn bộ cart item đang được chọn. @param {string} userId - ID người dùng. @returns {Promise<Object>} Giỏ hàng sau xóa. */
async function removeSelectedItems(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.selected === false);
  await cart.save();

  return getCart(userId);
}

module.exports = {
  addItem,
  getCart,
  mergeItems,
  removeItem,
  removeSelectedItems,
  updateItem,
};
