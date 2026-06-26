// cart.service.js - Business logic cho Cart
const mongoose = require('mongoose');
const Cart = require('./cart.model');
const Product = require('../products/product.model');

function ensureObjectId(id, message = 'ID khong hop le') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

function normalizeQuantity(quantity) {
  const normalized = Number(quantity);
  if (!Number.isFinite(normalized) || normalized < 1) return 1;
  return Math.floor(normalized);
}

async function getOrCreateCart(userId) {
  ensureObjectId(userId, 'User ID khong hop le');

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
}

function toClientItem(item) {
  const product = item.productId;
  const productId = product?._id || product;

  return {
    id: String(productId),
    productId: String(productId),
    name: product?.name || 'San pham',
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

async function addItem(userId, productId, quantity = 1, selected = true) {
  ensureObjectId(productId, 'Product ID khong hop le');

  const product = await Product.findById(productId);
  if (!product || product.isActive === false) {
    const error = new Error('Khong tim thay san pham');
    error.statusCode = 404;
    throw error;
  }

  if ((product.stock || 0) < 1) {
    const error = new Error('San pham da het hang');
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

async function mergeItems(userId, items = []) {
  if (!Array.isArray(items)) {
    const error = new Error('Danh sach gio hang khong hop le');
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

async function updateItem(userId, productId, data = {}) {
  ensureObjectId(productId, 'Product ID khong hop le');

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((cartItem) => String(cartItem.productId) === String(productId));
  if (!item) {
    const error = new Error('Khong tim thay san pham trong gio hang');
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

async function removeItem(userId, productId) {
  ensureObjectId(productId, 'Product ID khong hop le');

  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));
  await cart.save();

  return getCart(userId);
}

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
