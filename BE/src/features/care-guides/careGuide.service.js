// careGuide.service.js - Business logic cho CareGuides
// Cung cấp các hàm CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa care guide
const CareGuide = require('./careGuide.model');

/**
 * Lấy danh sách care guides, có hỗ trợ lọc và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<object>} { careGuides, total, pages, currentPage }
 */
async function getAllCareGuides(filters = {}) {
  const { plantId, season, sort, page = 1, limit = 10 } = filters;
  const query = {};

  if (plantId) {
    query.plantId = plantId;
  }
  if (season) {
    query.season = season;
  }

  const total = await CareGuide.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const safePage = Math.max(Number(page), 1);
  const safeLimit = Math.max(Number(limit), 10);

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'title') sortOption = { title: 1 };

  const careGuides = await CareGuide.find(query)
    .sort(sortOption)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return { careGuides, total, pages, currentPage: safePage };
}

/**
 * Lấy chi tiết một care guide theo id.
 * @param {string} id - CareGuide id
 * @returns {Promise<object|null>} CareGuide document hoặc null
 */
async function getCareGuideById(id) {
  if (!id) {
    throw new Error('CareGuide ID is required');
  }
  return CareGuide.findById(id).lean();
}

/**
 * Tạo mới một care guide.
 * @param {Object} data - Dữ liệu care guide mới
 * @returns {Promise<object>} CareGuide document đã tạo
 */
async function createCareGuide(data) {
  if (!data.plantId || !data.plantId.trim()) {
    throw new Error('Plant ID is required');
  }
  if (!data.title || !data.title.trim()) {
    throw new Error('Title is required');
  }

  const careGuide = new CareGuide(data);
  return careGuide.save();
}

/**
 * Cập nhật một care guide theo id.
 * @param {string} id - CareGuide id
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<object|null>} CareGuide document đã cập nhật hoặc null
 */
async function updateCareGuide(id, data) {
  if (!id) {
    throw new Error('CareGuide ID is required');
  }

  if (data.title !== undefined && !data.title.trim()) {
    throw new Error('Title cannot be empty');
  }

  return CareGuide.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

/**
 * Xóa một care guide theo id.
 * @param {string} id - CareGuide id
 * @returns {Promise<object|null>} CareGuide document đã xóa hoặc null
 */
async function deleteCareGuide(id) {
  if (!id) {
    throw new Error('CareGuide ID is required');
  }

  return CareGuide.findByIdAndDelete(id);
}

module.exports = {
  getAllCareGuides,
  getCareGuideById,
  createCareGuide,
  updateCareGuide,
  deleteCareGuide,
};
