// plant.service.js - Business logic cho Plants
const { Plant, PlantCategory } = require('./plant.model');

/**
 * Lấy danh sách cây, có hỗ trợ lọc theo category và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách cây
 */
async function getAllPlants(filters = {}) {
  const { category, search, page, limit } = filters;
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

  let plantQuery = Plant.find(query).sort({ name: 1 });

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

