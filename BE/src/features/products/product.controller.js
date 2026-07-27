// product.controller.js - Xử lý request/response cho Products
const productService = require('./product.service');

/** Lấy chi tiết sản phẩm theo route param. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, message: 'Lấy sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
}

/** Lấy danh sách sản phẩm theo query filter/phân trang. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getAllProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice, minRating, sortBy, page, limit, includeInactive } = req.query;
    const result = await productService.getAllProducts({
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      page,
      limit,
      includeInactive: includeInactive === 'true'
    });
    res.json({ success: true, message: 'Lấy danh sách sản phẩm thành công', data: result });
  } catch (error) {
    next(error);
  }
}

/** Lấy toàn bộ danh mục sản phẩm. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getAllCategories(req, res, next) {
  try {
    const categories = await productService.getAllCategories();
    res.json({ success: true, message: 'Lấy danh sách danh mục thành công', data: categories });
  } catch (error) {
    next(error);
  }
}

/** Tạo danh mục sản phẩm từ request body. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function createCategory(req, res, next) {
  try {
    const category = await productService.createCategory(req.body);
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
  } catch (error) {
    next(error);
  }
}

/** Cập nhật danh mục sản phẩm. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
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

/** Xóa danh mục sản phẩm. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
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

/** Tạo sản phẩm từ request body. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: product });
  } catch (error) {
    next(error);
  }
}

/** Cập nhật sản phẩm theo route param. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
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

/** Xóa sản phẩm theo route param. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
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

