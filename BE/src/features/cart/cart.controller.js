// cart.controller.js - Xu ly request/response cho Cart
const cartService = require('./cart.service');
const { success, created, error } = require('../../utils/apiResponse');

/** Trả giỏ hàng của người dùng hiện tại. @param {Object} req @param {Object} res @returns {Promise<Object>} HTTP response. */
async function getMyCart(req, res) {
  try {
    const cart = await cartService.getCart(req.user.id);
    return success(res, 'Lấy giỏ hàng thành công', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/** Thêm sản phẩm từ body vào giỏ. @param {Object} req @param {Object} res @returns {Promise<Object>} HTTP response. */
async function addCartItem(req, res) {
  try {
    const cart = await cartService.addItem(
      req.user.id,
      req.body.productId,
      req.body.quantity,
      req.body.selected
    );
    return created(res, 'Đã thêm sản phẩm vào giỏ hàng', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/** Hợp nhất giỏ local vào tài khoản. @param {Object} req @param {Object} res @returns {Promise<Object>} HTTP response. */
async function mergeCart(req, res) {
  try {
    const cart = await cartService.mergeItems(req.user.id, req.body.items);
    return success(res, 'Đồng bộ giỏ hàng thành công', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/** Cập nhật cart item theo productId. @param {Object} req @param {Object} res @returns {Promise<Object>} HTTP response. */
async function updateCartItem(req, res) {
  try {
    const cart = await cartService.updateItem(req.user.id, req.params.productId, req.body);
    return success(res, 'Cập nhật giỏ hàng thành công', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/** Xóa cart item theo productId. @param {Object} req @param {Object} res @returns {Promise<Object>} HTTP response. */
async function removeCartItem(req, res) {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.productId);
    return success(res, 'Đã xóa sản phẩm khỏi giỏ hàng', cart);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/** Xóa toàn bộ cart item đang chọn. @param {Object} req @param {Object} res @returns {Promise<Object>} HTTP response. */
async function removeSelectedItems(req, res) {
  try {
    const cart = await cartService.removeSelectedItems(req.user.id);
    return success(res, 'Đã xóa sản phẩm đã thanh toán khỏi giỏ hàng', cart);
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
