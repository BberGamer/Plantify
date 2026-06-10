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

async function getAllProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice, minRating, sortBy, page, limit } = req.query;
    const result = await productService.getAllProducts({
      search,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      sortBy,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 6
    });
    res.json({ success: true, message: 'Lấy danh sách sản phẩm thành công', data: result });
  } catch (error) {
    next(error);
  }
}

async function getAllCategories(req, res, next) {
  try {
    const categories = await productService.getAllCategories();
    res.json({ success: true, message: 'Lấy danh sách danh mục thành công', data: categories });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProductById,
  getAllProducts,
  getAllCategories
};

