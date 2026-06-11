// plant.service.js - Business logic cho Plants
const { Plant, PlantCategory } = require('./plant.model');

/**
 * Lấy danh sách cây, có hỗ trợ lọc và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<object>} { plants, total, pages, currentPage }
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
  const { search, tag, difficulty, sunlight, watering, sort, page = 1, limit = 9 } = filters;
  const query = {};

  // Search theo name, scientificName, commonNames
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { scientificName: { $regex: search, $options: 'i' } },
      { commonNames: { $regex: search, $options: 'i' } }
    ];
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

  const total = await Plant.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const safePage = Math.max(Number(page), 1);
  const safeLimit = Math.max(Number(limit), 9);

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
 * Lấy tất cả danh mục cây cảnh
 */
async function getAllCategories() {
  return await PlantCategory.find({ isActive: true }).sort({ name: 1 }).lean();
}

module.exports = {
  getAllPlants,
  getAllCategories
};

module.exports = { getAllPlants, getAllTags };
