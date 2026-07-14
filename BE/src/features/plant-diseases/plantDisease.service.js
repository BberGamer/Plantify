// Business logic cho Plant Diseases.
const mongoose = require('mongoose');
const PlantDisease = require('./plantDisease.model');
const Plant = require('../plants/plant.model');

const PLANT_DISEASE_FIELDS = [
  'plantId',
  'name',
  'symptoms',
  'causes',
  'treatment',
  'prevention',
  'images',
];

function pickPlantDiseaseFields(data = {}) {
  return PLANT_DISEASE_FIELDS.reduce((result, field) => {
    if (data[field] !== undefined) result[field] = data[field];
    return result;
  }, {});
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
    throw createHttpError(`${fieldName} phai la so nguyen duong`, 400);
  }

  return Math.min(parsedValue, maxValue);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensurePlantExists(plantId) {
  ensureObjectId(plantId, 'Plant ID khong hop le');
  const plant = await Plant.findById(plantId).select('_id').lean();
  if (!plant) {
    throw createHttpError('Khong tim thay cay', 404);
  }
}

async function getAllPlantDiseases(filters = {}) {
  const { plantId, search, sort, page = 1, limit = 10 } = filters;
  const query = {};

  if (plantId) {
    ensureObjectId(plantId, 'Plant ID khong hop le');
    query.plantId = plantId;
  }

  const keyword = String(search || '').trim();
  if (keyword) {
    const matchingPlants = await Plant.find({
      name: { $regex: escapeRegex(keyword), $options: 'i' }
    }).select('_id');
    const plantIds = matchingPlants.map(p => p._id);

    const conditions = ['name', 'symptoms', 'causes', 'treatment', 'prevention'].map((field) => ({
      [field]: { $regex: escapeRegex(keyword), $options: 'i' },
    }));

    if (plantIds.length > 0) {
      conditions.push({ plantId: { $in: plantIds } });
    }

    query.$or = conditions;
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
    .populate('plantId', 'name')
    .sort(sortOption)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return { diseases, total, pages, currentPage: safePage };
}

async function getPlantDiseaseById(id) {
  ensureObjectId(id, 'PlantDisease ID khong hop le');
  return PlantDisease.findById(id).lean();
}

async function createPlantDisease(data = {}) {
  if (!data.plantId) throw createHttpError('Plant ID is required', 400);
  if (typeof data.name !== 'string' || !data.name.trim()) {
    throw createHttpError('Disease name is required', 400);
  }

  await ensurePlantExists(data.plantId);

  return new PlantDisease(pickPlantDiseaseFields(data)).save();
}

async function updatePlantDisease(id, data = {}) {
  ensureObjectId(id, 'PlantDisease ID khong hop le');

  const updateData = pickPlantDiseaseFields(data);
  if (updateData.plantId !== undefined && !updateData.plantId) {
    throw createHttpError('Plant ID cannot be empty', 400);
  }
  if (updateData.plantId !== undefined) {
    await ensurePlantExists(updateData.plantId);
  }
  if (updateData.name !== undefined && (
    typeof updateData.name !== 'string' || !updateData.name.trim()
  )) {
    throw createHttpError('Disease name cannot be empty', 400);
  }
  if (!Object.keys(updateData).length) {
    throw createHttpError('Khong co du lieu cap nhat hop le', 400);
  }

  return PlantDisease.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();
}

async function deletePlantDisease(id) {
  ensureObjectId(id, 'PlantDisease ID khong hop le');
  return PlantDisease.findByIdAndDelete(id);
}

module.exports = {
  getAllPlantDiseases,
  getPlantDiseaseById,
  createPlantDisease,
  updatePlantDisease,
  deletePlantDisease,
};
