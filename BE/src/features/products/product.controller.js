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
    const { search, category, minPrice, maxPrice, minRating, sortBy, page, limit, includeInactive } = req.query;
    const result = await productService.getAllProducts({
      search,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      sortBy,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 6,
      includeInactive: includeInactive === 'true'
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

async function createCategory(req, res, next) {
  try {
    const category = await productService.createCategory(req.body);
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await productService.updateCategory(id, req.body);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.json({ success: true, message: 'Cập nhật danh mục thành công', data: category });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await productService.deleteCategory(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.json({ success: true, message: 'Xóa danh mục thành công', data: category });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ success: true, message: 'Xóa sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProductById,
  getAllProducts,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct
};

