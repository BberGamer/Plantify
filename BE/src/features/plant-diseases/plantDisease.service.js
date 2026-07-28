// plantDisease.service.js - Business logic cho kho tri thức bệnh cây
// Chuẩn hóa canonical key, danh sách kiến thức và liên kết sản phẩm
const mongoose = require('mongoose');
const PlantDisease = require('./plantDisease.model');
const Plant = require('../plants/plant.model');
const Product = require('../products/product.model');

const DISEASE_CATEGORIES = new Set([
  'disease',
  'pest',
  'nutrient',
  'environment',
]);

const PLANT_DISEASE_FIELDS = [
  'affectedPlantIds',
  'name',
  'diseaseKey',
  'aliases',
  'category',
  'symptoms',
  'causes',
  'treatments',
  'preventions',
  'recommendedProducts',
  'images',
  'isActive',
];

/**
 * Chuyển tên bệnh thành canonical key dạng kebab-case ASCII.
 * @param {string} value - Tên bệnh hoặc key do Content Manager nhập
 * @returns {string} Canonical key đã chuẩn hóa
 */
function normalizeDiseaseKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Chuẩn hóa textarea hoặc mảng string thành mảng không rỗng, không trùng.
 * @param {string|string[]} value - Dữ liệu từ API
 * @param {string} fieldName - Tên field dùng trong thông báo lỗi
 * @returns {string[]} Danh sách string đã chuẩn hóa
 */
function normalizeStringList(value, fieldName) {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\r?\n/)
      : null;

  if (!values) {
    throw createHttpError(`${fieldName} phải là chuỗi hoặc mảng chuỗi`, 400);
  }

  const normalizedValues = values
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return normalizedValues.filter((item, index) => (
    normalizedValues.findIndex(
      (candidate) => candidate.toLocaleLowerCase('vi') === item.toLocaleLowerCase('vi')
    ) === index
  ));
}

/**
 * Chỉ lấy và chuẩn hóa các field được phép ghi vào PlantDisease.
 * Payload cũ treatment/prevention vẫn được nhận và đổi sang field số nhiều.
 * @param {object} data - Request payload
 * @param {boolean} isCreate - Có phải thao tác tạo mới không
 * @returns {object} Payload an toàn cho Mongoose
 */
function normalizePlantDiseaseFields(data = {}, isCreate = false) {
  const sourceData = { ...data };
  if (sourceData.affectedPlantIds === undefined && sourceData.plantId !== undefined) {
    sourceData.affectedPlantIds = sourceData.plantId ? [sourceData.plantId] : [];
  }
  if (sourceData.treatments === undefined && sourceData.treatment !== undefined) {
    sourceData.treatments = sourceData.treatment;
  }
  if (sourceData.preventions === undefined && sourceData.prevention !== undefined) {
    sourceData.preventions = sourceData.prevention;
  }

  const result = PLANT_DISEASE_FIELDS.reduce((normalized, field) => {
    if (sourceData[field] !== undefined) normalized[field] = sourceData[field];
    return normalized;
  }, {});

  if (isCreate && result.diseaseKey === undefined && data.name !== undefined) {
    result.diseaseKey = data.name;
  }
  if (result.diseaseKey !== undefined) {
    result.diseaseKey = normalizeDiseaseKey(result.diseaseKey);
    if (!result.diseaseKey) {
      throw createHttpError('Mã bệnh canonical không hợp lệ', 400);
    }
  }

  ['aliases', 'symptoms', 'causes', 'treatments', 'preventions', 'images']
    .forEach((field) => {
      if (result[field] !== undefined) {
        result[field] = normalizeStringList(result[field], field);
      }
    });

  if (result.category !== undefined) {
    result.category = String(result.category).trim().toLowerCase();
    if (!DISEASE_CATEGORIES.has(result.category)) {
      throw createHttpError('Danh mục bệnh không hợp lệ', 400);
    }
  }

  if (result.recommendedProducts !== undefined) {
    const productIds = Array.isArray(result.recommendedProducts)
      ? result.recommendedProducts
      : [result.recommendedProducts];

    result.recommendedProducts = [...new Set(
      productIds.map((productId) => String(productId || '').trim()).filter(Boolean)
    )];
    result.recommendedProducts.forEach((productId) => {
      ensureObjectId(productId, 'Product ID được khuyến nghị không hợp lệ');
    });
  }

  if (result.affectedPlantIds !== undefined) {
    if (!Array.isArray(result.affectedPlantIds)) {
      throw createHttpError('affectedPlantIds phải là mảng', 400);
    }

    result.affectedPlantIds = [...new Set(
      result.affectedPlantIds
        .map((plantId) => String(plantId || '').trim())
        .filter(Boolean)
    )];
    result.affectedPlantIds.forEach((plantId) => {
      ensureObjectId(plantId, 'Plant ID bị ảnh hưởng không hợp lệ');
    });
  }

  if (result.isActive !== undefined && typeof result.isActive !== 'boolean') {
    throw createHttpError('isActive phải là boolean', 400);
  }

  return result;
}

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

function parsePositiveInteger(value, fieldName, fallback, maxValue) {
  if (value === undefined) return fallback;

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createHttpError(`${fieldName} phải là số nguyên dương`, 400);
  }

  return Math.min(parsedValue, maxValue);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function throwDuplicateDiseaseKeyError(error) {
  if (error?.code === 11000 && (
    error?.keyPattern?.diseaseKey || error?.keyValue?.diseaseKey
  )) {
    throw createHttpError('Mã bệnh canonical đã tồn tại', 409);
  }
  throw error;
}

async function ensureAffectedPlantsExist(affectedPlantIds = []) {
  if (affectedPlantIds.length === 0) return;

  const existingPlantCount = await Plant.countDocuments({
    _id: { $in: affectedPlantIds },
  });

  if (existingPlantCount !== affectedPlantIds.length) {
    throw createHttpError('Một hoặc nhiều cây bị ảnh hưởng không tồn tại', 404);
  }
}

/**
 * Xác nhận toàn bộ sản phẩm đề xuất thực sự tồn tại trong database.
 * @param {string[]} recommendedProductIds - Danh sách Product ID đã chuẩn hóa
 */
async function ensureRecommendedProductsExist(recommendedProductIds = []) {
  if (recommendedProductIds.length === 0) return;

  const existingProductCount = await Product.countDocuments({
    _id: { $in: recommendedProductIds },
  });

  if (existingProductCount !== recommendedProductIds.length) {
    throw createHttpError('Một hoặc nhiều sản phẩm đề xuất không tồn tại', 404);
  }
}

function normalizeKnowledgeList(value, legacyValue) {
  const selectedValue = Array.isArray(value) && value.length === 0
    ? legacyValue
    : value ?? legacyValue;

  if (Array.isArray(selectedValue)) {
    return selectedValue.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (typeof selectedValue === 'string' && selectedValue.trim()) {
    return [selectedValue.trim()];
  }

  return [];
}

function getReferenceId(reference) {
  return String(reference?._id || reference || '');
}

/**
 * Chuẩn hóa dữ liệu đọc để trang chi tiết vẫn hiện các bệnh được tạo trước khi
 * quan hệ plantId được đổi thành affectedPlantIds[].
 * @param {object} disease - PlantDisease lấy từ database
 * @returns {object} PlantDisease theo contract hiện tại
 */
function normalizePlantDiseaseForRead(disease = {}) {
  const affectedPlants = Array.isArray(disease.affectedPlantIds)
    ? [...disease.affectedPlantIds]
    : [];

  if (
    disease.plantId
    && !affectedPlants.some(
      (affectedPlant) => getReferenceId(affectedPlant) === getReferenceId(disease.plantId)
    )
  ) {
    affectedPlants.push(disease.plantId);
  }

  return {
    ...disease,
    affectedPlantIds: affectedPlants,
    symptoms: normalizeKnowledgeList(disease.symptoms),
    causes: normalizeKnowledgeList(disease.causes),
    treatments: normalizeKnowledgeList(disease.treatments, disease.treatment),
    preventions: normalizeKnowledgeList(disease.preventions, disease.prevention),
  };
}

/** Lấy bệnh cây theo search, severity, cây ảnh hưởng và phân trang. @param {Object} [filters={}] - Bộ lọc. @returns {Promise<Object>} Danh sách và metadata. */
async function getAllPlantDiseases(filters = {}) {
  const { affectedPlantId, search, sort, page = 1, limit = 10 } = filters;
  const query = {};

  if (affectedPlantId) {
    ensureObjectId(affectedPlantId, 'Affected Plant ID không hợp lệ');
    const plantObjectId = new mongoose.Types.ObjectId(affectedPlantId);
    query.$or = [
      { affectedPlantIds: plantObjectId },
      { plantId: plantObjectId },
    ];
  }

  const keyword = String(search || '').trim();
  if (keyword) {
    const matchingPlants = await Plant.find({
      name: { $regex: escapeRegex(keyword), $options: 'i' }
    }).select('_id');
    const plantIds = matchingPlants.map(p => p._id);

    const conditions = [
      'name',
      'diseaseKey',
      'aliases',
      'category',
      'symptoms',
      'causes',
      'treatments',
      'preventions',
    ].map((field) => ({
      [field]: { $regex: escapeRegex(keyword), $options: 'i' },
    }));

    if (plantIds.length > 0) {
      conditions.push({ affectedPlantIds: { $in: plantIds } });
    }

    query.$and = [{ $or: conditions }];
  }

  const safePage = parsePositiveInteger(page, 'page', 1, Number.MAX_SAFE_INTEGER);
  const safeLimit = parsePositiveInteger(limit, 'limit', 10, 100);
  const total = await PlantDisease.countDocuments(query);
  const pages = Math.max(Math.ceil(total / safeLimit), 1);
  
  let sortOption = { _id: -1 };
  if (sort === 'newest') sortOption = { _id: -1 };
  else if (sort === 'oldest') sortOption = { _id: 1 };
  else if (sort === 'za') sortOption = { name: -1 };
  else if (sort === 'name') sortOption = { name: 1 };

  const diseases = await PlantDisease.find(query)
    .populate('affectedPlantIds', 'name scientificName thumbnail')
    .populate(
      'recommendedProducts',
      'name thumbnail images price stock ratingAverage ratingCount isActive'
    )
    .sort(sortOption)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return {
    diseases: diseases.map(normalizePlantDiseaseForRead),
    total,
    pages,
    currentPage: safePage,
  };
}

/** Lấy chi tiết bệnh cây đã populate liên kết. @param {string} id - ID bệnh cây. @returns {Promise<Object>} Bệnh cây. */
async function getPlantDiseaseById(id) {
  ensureObjectId(id, 'PlantDisease ID không hợp lệ');
  const disease = await PlantDisease.findById(id)
    .populate('affectedPlantIds', 'name scientificName thumbnail')
    .populate(
      'recommendedProducts',
      'name thumbnail images price stock ratingAverage ratingCount isActive'
    )
    .lean();
  return disease ? normalizePlantDiseaseForRead(disease) : null;
}

/** Validate liên kết và tạo bệnh cây. @param {Object} [data={}] - Dữ liệu bệnh. @returns {Promise<Object>} Bệnh vừa tạo. */
async function createPlantDisease(data = {}) {
  if (typeof data.name !== 'string' || !data.name.trim()) {
    throw createHttpError('Tên bệnh là bắt buộc', 400);
  }

  const createData = normalizePlantDiseaseFields(data, true);
  await ensureAffectedPlantsExist(createData.affectedPlantIds);
  await ensureRecommendedProductsExist(createData.recommendedProducts);

  try {
    return await new PlantDisease(createData).save();
  } catch (error) {
    return throwDuplicateDiseaseKeyError(error);
  }
}

/** Cập nhật bệnh cây và xác minh các reference mới. @param {string} id - ID bệnh. @param {Object} [data={}] - Dữ liệu cập nhật. @returns {Promise<Object>} Bệnh sau cập nhật. */
async function updatePlantDisease(id, data = {}) {
  ensureObjectId(id, 'PlantDisease ID không hợp lệ');

  const updateData = normalizePlantDiseaseFields(data);
  if (updateData.affectedPlantIds !== undefined) {
    await ensureAffectedPlantsExist(updateData.affectedPlantIds);
  }
  if (updateData.recommendedProducts !== undefined) {
    await ensureRecommendedProductsExist(updateData.recommendedProducts);
  }
  if (updateData.name !== undefined && (
    typeof updateData.name !== 'string' || !updateData.name.trim()
  )) {
    throw createHttpError('Tên bệnh không được để trống', 400);
  }
  if (!Object.keys(updateData).length) {
    throw createHttpError('Không có dữ liệu cập nhật hợp lệ', 400);
  }

  try {
    return await PlantDisease.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
  } catch (error) {
    return throwDuplicateDiseaseKeyError(error);
  }
}

/** Xóa bệnh cây. @param {string} id - ID bệnh. @returns {Promise<Object>} Bệnh đã xóa. */
async function deletePlantDisease(id) {
  ensureObjectId(id, 'PlantDisease ID không hợp lệ');
  return PlantDisease.findByIdAndDelete(id);
}

module.exports = {
  getAllPlantDiseases,
  getPlantDiseaseById,
  createPlantDisease,
  updatePlantDisease,
  deletePlantDisease,
};
