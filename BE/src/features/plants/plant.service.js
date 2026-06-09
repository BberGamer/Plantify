// plant.service.js - Business logic cho Plants
const { Plant } = require('./plant.model');

/**
 * Lấy danh sách cây, có hỗ trợ lọc theo category và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách cây
 */
async function getAllPlants(filters = {}) {
  const { category, page, limit } = filters;
  const query = {};

  if (category) {
    query.categoryId = category;
  }

  let plantQuery = Plant.find(query).sort({ name: 1 });

  if (page && limit) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    plantQuery = plantQuery.skip((safePage - 1) * safeLimit).limit(safeLimit);
  }

  return plantQuery.lean();
}

module.exports = { getAllPlants };
