// order.controller.js - Xu ly request/response cho Orders
const orderService = require('./order.service');
const { success, created, error } = require('../../utils/apiResponse');

async function createOrder(req, res) {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    return created(res, 'Dat hang thanh cong', order);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    return success(res, 'Lay danh sach don hang thanh cong', orders);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
};
