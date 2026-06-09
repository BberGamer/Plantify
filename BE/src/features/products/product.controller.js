// product.controller.js - Xử lý request/response cho Products
const mongoose = require('mongoose');
const productService = require('./product.service');

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const product = await productService.getProductById(id);
    res.json({ success: true, message: 'Lấy sản phẩm thành công', data: product });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    next(error);
  }
}

module.exports = { getProductById };
