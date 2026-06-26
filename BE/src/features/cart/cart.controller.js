// cart.controller.js - Xu ly request/response cho Cart
const cartService = require('./cart.service');
const { success, created, error } = require('../../utils/apiResponse');

async function getMyCart(req, res) {
  try {
    const cart = await cartService.getCart(req.user.id);
    return success(res, 'Lay gio hang thanh cong', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

async function addCartItem(req, res) {
  try {
    const cart = await cartService.addItem(
      req.user.id,
      req.body.productId,
      req.body.quantity,
      req.body.selected
    );
    return created(res, 'Da them san pham vao gio hang', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

async function mergeCart(req, res) {
  try {
    const cart = await cartService.mergeItems(req.user.id, req.body.items);
    return success(res, 'Dong bo gio hang thanh cong', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

async function updateCartItem(req, res) {
  try {
    const cart = await cartService.updateItem(req.user.id, req.params.productId, req.body);
    return success(res, 'Cap nhat gio hang thanh cong', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

async function removeCartItem(req, res) {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.productId);
    return success(res, 'Da xoa san pham khoi gio hang', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

async function removeSelectedItems(req, res) {
  try {
    const cart = await cartService.removeSelectedItems(req.user.id);
    return success(res, 'Da xoa san pham da thanh toan khoi gio hang', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

module.exports = {
  addCartItem,
  getMyCart,
  mergeCart,
  removeCartItem,
  removeSelectedItems,
  updateCartItem,
};
