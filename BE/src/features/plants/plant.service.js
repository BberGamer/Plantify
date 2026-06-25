// plant.service.js - Business logic cho Plants
// Cung cấp các hàm CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa cây
const Plant = require('./plant.model');
const PlantCategory = require('./plantCategory.model');
const PlantDisease = require('../plant-diseases/plantDisease.model');

const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

/**
 * Lấy danh sách cây, có hỗ trợ lọc và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<object>} { plants, total, pages, currentPage }
 */
async function getAllPlants(filters = {}) {
  const { search, category, tag, difficulty, sunlight, watering, sort, page = 1, limit = 9 } = filters;
  const query = {};

  // Filter theo categoryId
  if (category) {
    query.categoryId = category;
  }

  // Filter theo tag
  if (tag) {
    query.tags = tag;
  }

  // Filter theo difficultyLevel
  if (difficulty) {
    query.difficultyLevel = difficulty;
  }

  // Filter theo sunlight
  if (sunlight) {
    query.sunlight = sunlight;
  }

  // Filter theo watering
  if (watering) {
    query.watering = watering;
  }

  const keyword = String(search || '').trim();
  if (keyword) {
    const diseaseMatches = await PlantDisease.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { symptoms: { $regex: keyword, $options: 'i' } },
        { causes: { $regex: keyword, $options: 'i' } },
        { treatment: { $regex: keyword, $options: 'i' } },
        { prevention: { $regex: keyword, $options: 'i' } },
      ],
    }).select('plantId').lean();

    const diseasePlantIds = [...new Set(
      diseaseMatches
        .map((disease) => disease.plantId?.toString())
        .filter(Boolean)
    )];

    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { scientificName: { $regex: keyword, $options: 'i' } },
      { commonNames: { $regex: keyword, $options: 'i' } },
    ];

    if (diseasePlantIds.length > 0) {
      query.$or.push({ _id: { $in: diseasePlantIds } });
    }
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 9, 9);
  const total = await Plant.countDocuments(query);
  const pages = Math.max(Math.ceil(total / safeLimit), 1);

  // Sort options
  let sortOption = { name: 1 };
  if (sort === 'za') sortOption = { name: -1 };
  else if (sort === 'popular') sortOption = { viewCount: -1 };
  else if (sort === 'difficulty') sortOption = { difficultyLevel: 1 };

  const plants = await Plant.find(query)
    .sort(sortOption)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return { plants, total, pages, currentPage: safePage };
}

/**
 * Lấy danh sách tags độc nhất từ plants.
 * @returns {Promise<Array>} Mảng tags độc nhất
 */
async function getAllTags() {
  const plants = await Plant.find({ tags: { $exists: true, $ne: [] } })
    .select('tags')
    .lean();
  
  const tagSet = new Set();
  plants.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

/**
 * Lấy chi tiết một cây theo id.
 * @param {string} id - Plant id
 * @param {boolean} populateCategory - Có populate category không
 * @returns {Promise<object|null>} Plant document hoặc null
 */
async function getPlantById(id, populateCategory = false) {
  if (!id) {
    throw new Error('Plant ID is required');
  }

  let query = Plant.findOne({ _id: id });
  if (populateCategory) {
    query = query.populate('categoryId', 'name slug thumbnail');
  }
  return query.lean();
}

/**
 * Tạo mới một cây.
 * @param {Object} data - Dữ liệu cây mới
 * @returns {Promise<object>} Plant document đã tạo
 */
async function createPlant(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Plant name is required');
  }
  if (!data.categoryId || !data.categoryId.trim()) {
    throw new Error('Category ID is required');
  }

  const plant = new Plant(data);
  return plant.save();
}

/**
 * Cập nhật một cây theo id.
 * @param {string} id - Plant id
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<object|null>} Plant document đã cập nhật hoặc null
 */
async function updatePlant(id, data) {
  if (!id) {
    throw new Error('Plant ID is required');
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('Plant name cannot be empty');
  }
  if (data.categoryId !== undefined && !data.categoryId.trim()) {
    throw new Error('Category ID cannot be empty');
  }

  return Plant.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

/**
 * Xóa một cây theo id.
 * @param {string} id - Plant id
 * @returns {Promise<object|null>} Plant document đã xóa hoặc null
 */
async function deletePlant(id) {
  if (!id) {
    throw new Error('Plant ID is required');
  }

  return Plant.findByIdAndDelete(id);
}

/**
 * Lấy danh sách tất cả danh mục cây.
 * @returns {Promise<Array>} Mảng PlantCategory
 */
async function getAllCategories() {
  return PlantCategory.find().sort({ name: 1 }).lean();
}

/**
 * Tạo mới một danh mục cây.
 * @param {Object} data - Dữ liệu danh mục mới
 * @returns {Promise<object>} PlantCategory document đã tạo
 */
async function createCategory(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Category name is required');
  }
  const category = new PlantCategory({
    name: data.name.trim(),
    slug: toSlug(data.name.trim()),
  });
  return category.save();
}

/**
 * Xóa một danh mục cây theo id.
 * @param {string} id - Category id
 * @returns {Promise<object|null>} PlantCategory document đã xóa hoặc null
 */
async function deleteCategory(id) {
  if (!id) {
    throw new Error('Category ID is required');
  }
  return PlantCategory.findOneAndDelete({ id });
}

/**
 * Cập nhật một danh mục cây theo id.
 * @param {string} id - Category id (MongoDB _id)
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<object|null>} PlantCategory document đã cập nhật hoặc null
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
  return PlantCategory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
}

module.exports = {
  getAllPlants, getAllTags, getPlantById, createPlant, updatePlant, deletePlant,
  getAllCategories, createCategory, deleteCategory, updateCategory
};
