// product.service.js - Business logic cho Products
const Product = require('./product.model');
const ProductCategory = require('./product-category.model');
const mongoose = require('mongoose');

/**
 * Lấy product theo id, populate category
 * @param {string} id - Product id
 * @returns {Promise<Object>} Product object
 */
async function getProductById(id) {
  const product = await Product.findById(id).populate('categoryId');
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

/**
 * Lấy danh sách sản phẩm theo bộ lọc, tìm kiếm, phân trang và sắp xếp
 */
async function getAllProducts({ search, category, minPrice, maxPrice, minRating, sortBy, page = 1, limit = 6 }) {
  const query = { isActive: true };

  // Tìm kiếm theo tên hoặc mô tả
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Lọc theo danh mục (category slug, name hoặc ID)
  if (category && category !== 'Tất cả') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.categoryId = category;
    } else {
      const foundCategory = await ProductCategory.findOne({
        $or: [
          { slug: category },
          { name: category }
        ]
      });
      if (foundCategory) {
        query.categoryId = foundCategory._id;
      } else {
        // Nếu không tìm thấy danh mục, trả về kết quả rỗng
        return { products: [], total: 0, pages: 0, currentPage: page };
      }
    }
  }

  // Lọc theo khoảng giá
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  // Lọc theo rating trung bình
  if (minRating !== undefined) {
    query.ratingAverage = { $gte: Number(minRating) };
  }

  // Sắp xếp
  let sort = {};
  if (sortBy === 'newest') {
    sort.createdAt = -1;
  } else if (sortBy === 'price-low') {
    sort.price = 1;
  } else if (sortBy === 'price-high') {
    sort.price = -1;
  } else if (sortBy === 'rating') {
    sort.ratingAverage = -1;
  } else {
    // Phổ biến nhất (mặc định)
    sort.ratingCount = -1;
  }

  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .populate('categoryId')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  return {
    products,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page)
  };
}

/**
 * Lấy tất cả danh mục sản phẩm
 */
async function getAllCategories() {
  return await ProductCategory.find();
}

module.exports = {
  getProductById,
  getAllProducts,
  getAllCategories
};

