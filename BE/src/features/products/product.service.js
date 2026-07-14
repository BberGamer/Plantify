// product.service.js - Business logic cho Products
const Product = require('./product.model');
const ProductCategory = require('./product-category.model');
const Order = require('../orders/order.model');
const mongoose = require('mongoose');

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(message, 400);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePositiveInteger(value, fieldName, fallback, maxValue) {
  if (value === undefined) return fallback;
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createHttpError(`${fieldName} phai la so nguyen duong`, 400);
  }
  return Math.min(parsedValue, maxValue);
}

function parseNonNegativeNumber(value, fieldName, maxValue = Number.MAX_SAFE_INTEGER) {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > maxValue) {
    throw createHttpError(`${fieldName} khong hop le`, 400);
  }
  return parsedValue;
}

async function ensureCategoryExists(categoryId) {
  ensureObjectId(categoryId, 'Category ID khong hop le');
  const category = await ProductCategory.findById(categoryId).select('_id').lean();
  if (!category) {
    throw createHttpError('Khong tim thay danh muc', 404);
  }
}

const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

async function getSoldCountMap(productIds) {
  const ids = productIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (ids.length === 0) {
    return new Map();
  }

  const soldCounts = await Order.aggregate([
    {
      $match: {
        status: { $ne: 'cancelled' },
        $or: [
          { paymentMethod: 'COD' },
          { paymentStatus: 'paid' },
        ],
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.productId': { $in: ids } } },
    {
      $group: {
        _id: '$items.productId',
        soldCount: { $sum: '$items.quantity' },
      },
    },
  ]);

  return new Map(soldCounts.map((item) => [String(item._id), Number(item.soldCount || 0)]));
}

async function attachSoldCounts(products) {
  const productList = Array.isArray(products) ? products : [products];
  const soldCountMap = await getSoldCountMap(productList.map((product) => String(product._id)));
  const withCounts = productList.map((product) => ({
    ...product,
    soldCount: soldCountMap.get(String(product._id)) ?? Number(product.soldCount || 0),
  }));

  return Array.isArray(products) ? withCounts : withCounts[0];
}

/**
 * Lấy product theo id, populate category
 * @param {string} id - Product id
 * @returns {Promise<Object>} Product object
 */
async function getProductById(id) {
  ensureObjectId(id, 'Product ID khong hop le');
  const product = await Product.findById(id).populate('categoryId').lean();
  if (!product) {
    throw createHttpError('Product not found', 404);
  }
  return attachSoldCounts(product);
}

/**
 * Lấy danh sách sản phẩm theo bộ lọc, tìm kiếm, phân trang và sắp xếp
 */
async function getAllProducts({ search, category, minPrice, maxPrice, minRating, sortBy, page = 1, limit = 6, includeInactive = false }) {
  const query = includeInactive ? {} : { isActive: true };
  const safePage = parsePositiveInteger(page, 'page', 1, Number.MAX_SAFE_INTEGER);
  const safeLimit = parsePositiveInteger(limit, 'limit', 6, 100);

  // Tìm kiếm theo tên hoặc mô tả
  if (search) {
    query.$or = [
      { name: { $regex: escapeRegex(String(search)), $options: 'i' } },
      { description: { $regex: escapeRegex(String(search)), $options: 'i' } }
    ];
  }

  // Lọc theo danh mục (category slug, name hoặc ID)
  // Lọc theo danh mục: nhận cả id, slug hoặc name
  if (category && category !== 'all' && category !== 'Tất cả') {
    const categoryValue = String(category).trim();

    if (mongoose.Types.ObjectId.isValid(categoryValue)) {
      query.categoryId = new mongoose.Types.ObjectId(categoryValue);
    } else {
      const foundCategory = await ProductCategory.findOne({
        $or: [
          { slug: categoryValue },
          { name: { $regex: `^${escapeRegex(categoryValue)}$`, $options: 'i' } }
        ]
      }).lean();

      if (!foundCategory) {
        return {
          products: [],
          total: 0,
          pages: 0,
          currentPage: safePage
        };
      }

      query.categoryId = foundCategory._id;
    }
  }

  // Lọc theo khoảng giá
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = parseNonNegativeNumber(minPrice, 'minPrice');
    if (maxPrice !== undefined) query.price.$lte = parseNonNegativeNumber(maxPrice, 'maxPrice');
    if (query.price.$gte !== undefined && query.price.$lte !== undefined && query.price.$gte > query.price.$lte) {
      throw createHttpError('Khoang gia khong hop le', 400);
    }
  }

  // Lọc theo rating trung bình
  if (minRating !== undefined) {
    query.ratingAverage = { $gte: parseNonNegativeNumber(minRating, 'minRating', 5) };
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
    sort.soldCount = -1;
    sort.ratingCount = -1;
  }

  const skip = (safePage - 1) * safeLimit;

  const products = await Product.find(query)
    .populate('categoryId')
    .sort(sort)
    .skip(skip)
    .limit(safeLimit)
    .lean();

  const total = await Product.countDocuments(query);

  return {
    products: await attachSoldCounts(products),
    total,
    pages: Math.ceil(total / safeLimit),
    currentPage: safePage
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
async function createProduct(data = {}) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Product name is required');
  }

  if (!data.categoryId || !String(data.categoryId).trim()) {
    throw new Error('Category ID is required');
  }

  if (data.price === undefined || Number.isNaN(Number(data.price))) {
    throw new Error('Product price is required');
  }

  await ensureCategoryExists(String(data.categoryId).trim());

  const product = new Product({
    ...data,
    name: data.name.trim(),
    categoryId: String(data.categoryId).trim(),
    brand: data.brand?.trim() || '',
    thumbnail: data.thumbnail?.trim() || '',
    description: data.description?.trim() || '',
    usageGuide: data.usageGuide?.trim() || '',
    price: Number(data.price),
    stock: Number(data.stock || 0),
    soldCount: Number(data.soldCount || 0),
    tags: Array.isArray(data.tags) ? data.tags : []
  });

  return product.save();
}

/**
 * Cập nhật sản phẩm
 */
async function updateProduct(id, data = {}) {
  ensureObjectId(id, 'Product ID khong hop le');

  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('Product name cannot be empty');
  }

  if (data.categoryId !== undefined && !String(data.categoryId).trim()) {
    throw new Error('Category ID cannot be empty');
  }
  if (data.categoryId !== undefined) {
    await ensureCategoryExists(String(data.categoryId).trim());
  }

  const updateData = {
    ...data,
  };

  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.categoryId !== undefined) updateData.categoryId = String(data.categoryId).trim();
  if (data.brand !== undefined) updateData.brand = data.brand?.trim() || '';
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail?.trim() || '';
  if (data.description !== undefined) updateData.description = data.description?.trim() || '';
  if (data.usageGuide !== undefined) updateData.usageGuide = data.usageGuide?.trim() || '';
  if (data.price !== undefined) updateData.price = Number(data.price);
  if (data.stock !== undefined) updateData.stock = Number(data.stock || 0);
  if (data.soldCount !== undefined) updateData.soldCount = Number(data.soldCount || 0);
  if (data.tags !== undefined) updateData.tags = Array.isArray(data.tags) ? data.tags : [];

  return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
}

/**
 * Xóa sản phẩm
 */
async function deleteProduct(id) {
  ensureObjectId(id, 'Product ID khong hop le');

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

