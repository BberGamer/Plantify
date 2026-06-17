// plantDisease.service.js - Business logic cho PlantDiseases
// Cung cấp các hàm CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa bệnh cây
const PlantDisease = require('./plantDisease.model');

/**
 * Lấy danh sách bệnh cây, có hỗ trợ lọc và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<object>} { diseases, total, pages, currentPage }
 */
async function getAllPlantDiseases(filters = {}) {
  const { search, severity, sort, page = 1, limit = 10 } = filters;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { scientificName: { $regex: search, $options: 'i' } },
      { symptoms: { $regex: search, $options: 'i' } },
    ];
  }
  if (severity) {
    query.severity = severity;
  }

  const total = await PlantDisease.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const safePage = Math.max(Number(page), 1);
  const safeLimit = Math.max(Number(limit), 10);

  let sortOption = { name: 1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'severity') sortOption = { severity: -1 };

  const diseases = await PlantDisease.find(query)
    .sort(sortOption)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return { diseases, total, pages, currentPage: safePage };
}

/**
 * Lấy chi tiết một bệnh cây theo id.
 * @param {string} id - PlantDisease id
 * @returns {Promise<object|null>} PlantDisease document hoặc null
 */
async function getPlantDiseaseById(id) {
  if (!id) {
    throw new Error('PlantDisease ID is required');
  }
  return PlantDisease.findById(id).lean();
}

/**
 * Tạo mới một bệnh cây.
 * @param {Object} data - Dữ liệu bệnh cây mới
 * @returns {Promise<object>} PlantDisease document đã tạo
 */
async function createPlantDisease(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Disease name is required');
  }

  const disease = new PlantDisease(data);
  return disease.save();
}

/**
 * Cập nhật một bệnh cây theo id.
 * @param {string} id - PlantDisease id
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<object|null>} PlantDisease document đã cập nhật hoặc null
 */
async function updatePlantDisease(id, data) {
  if (!id) {
    throw new Error('PlantDisease ID is required');
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('Disease name cannot be empty');
  }

  return PlantDisease.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

/**
 * Xóa một bệnh cây theo id.
 * @param {string} id - PlantDisease id
 * @returns {Promise<object|null>} PlantDisease document đã xóa hoặc null
 */
async function deletePlantDisease(id) {
  if (!id) {
    throw new Error('PlantDisease ID is required');
  }

  return PlantDisease.findByIdAndDelete(id);
}

module.exports = {
  getAllPlantDiseases,
  getPlantDiseaseById,
  createPlantDisease,
  updatePlantDisease,
  deletePlantDisease,
};
