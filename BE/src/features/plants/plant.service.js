// plant.service.js - Business logic cho Plants
const { Plant, PlantCategory } = require('./plant.model');

/**
 * Lấy danh sách cây, có hỗ trợ lọc theo category và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách cây
 */
async function getAllPlants(filters = {}) {
  const { category, search, difficulty, sunlight, watering, sortBy, page, limit } = filters;
  const query = {};

  if (category && category !== 'Tất cả') {
    const foundCategory = await PlantCategory.findOne({
      $or: [
        { id: category },
        { slug: category },
        { name: category }
      ]
    });
    if (foundCategory) {
      query.categoryId = foundCategory.id || foundCategory._id;
    } else {
      return [];
    }
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { scientificName: { $regex: search, $options: 'i' } }
    ];
  }

  if (difficulty) {
    let diffVal = difficulty;
    if (difficulty === 'easy') diffVal = 'low';
    if (difficulty === 'hard') diffVal = 'high';
    query.difficultyLevel = diffVal;
  }

  if (sunlight) {
    query.sunlight = sunlight;
  }

  if (watering) {
    query.watering = watering;
  }

  let sort = {};
  if (sortBy === 'az') {
    sort.name = 1;
  } else if (sortBy === 'za') {
    sort.name = -1;
  } else if (sortBy === 'difficulty') {
    sort.difficultyLevel = 1;
  } else {
    // popular
    sort.createdAt = -1;
  }

  let plantQuery = Plant.find(query).sort(sort);

  if (page && limit) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    plantQuery = plantQuery.skip((safePage - 1) * safeLimit).limit(safeLimit);
  }

  return plantQuery.lean();
}

/**
 * Lấy tất cả danh mục cây cảnh
 */
async function getAllCategories() {
  return await PlantCategory.find({ isActive: true }).sort({ name: 1 }).lean();
}

module.exports = {
  getAllPlants,
  getAllCategories
};

