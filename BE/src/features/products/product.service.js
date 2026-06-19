// product.service.js - Business logic cho Products
const Product = require('./product.model');
const ProductCategory = require('./product-category.model');
const mongoose = require('mongoose');

const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

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
  return await ProductCategory.find().sort({ name: 1 }).lean();
}

/**
 * Tạo mới danh mục sản phẩm
 */
async function createCategory(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Category name is required');
  }

  const trimmedName = data.name.trim();
  const category = new ProductCategory({
    name: trimmedName,
    slug: toSlug(trimmedName)
  });

  return category.save();
}

/**
 * Cập nhật danh mục sản phẩm
 */
async function updateCategory(id, data) {
  if (!id) {
    throw new Error('Category ID is required');
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('Category name cannot be empty');
  }

  const updateData = {};
  if (data.name) {
    updateData.name = data.name.trim();
    updateData.slug = toSlug(data.name.trim());
  }

  return ProductCategory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
}

/**
 * Xóa danh mục sản phẩm
 */
async function deleteCategory(id) {
  if (!id) {
    throw new Error('Category ID is required');
  }

  return ProductCategory.findByIdAndDelete(id);
}

/**
 * Tạo mới sản phẩm
 */
async function createProduct(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Product name is required');
  }

  if (!data.categoryId || !String(data.categoryId).trim()) {
    throw new Error('Category ID is required');
  }

  if (data.price === undefined || Number.isNaN(Number(data.price))) {
    throw new Error('Product price is required');
  }

  const product = new Product({
    ...data,
    name: data.name.trim(),
    categoryId: String(data.categoryId).trim(),
    brand: data.brand?.trim() || '',
    thumbnail: data.thumbnail?.trim() || '',
    description: data.description?.trim() || '',
    price: Number(data.price),
    stock: Number(data.stock || 0),
    tags: Array.isArray(data.tags) ? data.tags : []
  });

  return product.save();
}

/**
 * Cập nhật sản phẩm
 */
async function updateProduct(id, data) {
  if (!id) {
    throw new Error('Product ID is required');
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('Product name cannot be empty');
  }

  if (data.categoryId !== undefined && !String(data.categoryId).trim()) {
    throw new Error('Category ID cannot be empty');
  }

  const updateData = {
    ...data,
  };

  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.categoryId !== undefined) updateData.categoryId = String(data.categoryId).trim();
  if (data.brand !== undefined) updateData.brand = data.brand?.trim() || '';
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail?.trim() || '';
  if (data.description !== undefined) updateData.description = data.description?.trim() || '';
  if (data.price !== undefined) updateData.price = Number(data.price);
  if (data.stock !== undefined) updateData.stock = Number(data.stock || 0);
  if (data.tags !== undefined) updateData.tags = Array.isArray(data.tags) ? data.tags : [];

  return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
}

/**
 * Xóa sản phẩm
 */
async function deleteProduct(id) {
  if (!id) {
    throw new Error('Product ID is required');
  }

  return Product.findByIdAndDelete(id);
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

