// product.controller.js - Xử lý request/response cho Products
const productService = require('./product.service');

async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, message: 'Lấy sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProductById };
