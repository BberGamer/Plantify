// Business logic cho Plant Diseases.
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

async function getAllPlantDiseases(filters = {}) {
  const { plantId, search, sort, page = 1, limit = 10 } = filters;
  const query = {};

  if (plantId) query.plantId = plantId;

  const keyword = String(search || '').trim();
  if (keyword) {
    const matchingPlants = await Plant.find({
      name: { $regex: keyword, $options: 'i' }
    }).select('_id');
    const plantIds = matchingPlants.map(p => p._id);

    const conditions = ['name', 'symptoms', 'causes', 'treatment', 'prevention'].map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    }));

    if (plantIds.length > 0) {
      conditions.push({ plantId: { $in: plantIds } });
    }

    query.$or = conditions;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 200);
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
  if (!id) throw new Error('PlantDisease ID is required');
  return PlantDisease.findById(id).lean();
}

async function createPlantDisease(data) {
  if (!data.plantId) throw new Error('Plant ID is required');
  if (typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('Disease name is required');
  }

  return new PlantDisease(pickPlantDiseaseFields(data)).save();
}

async function updatePlantDisease(id, data) {
  if (!id) throw new Error('PlantDisease ID is required');

  const updateData = pickPlantDiseaseFields(data);
  if (updateData.plantId !== undefined && !updateData.plantId) {
    throw new Error('Plant ID cannot be empty');
  }
  if (updateData.name !== undefined && (
    typeof updateData.name !== 'string' || !updateData.name.trim()
  )) {
    throw new Error('Disease name cannot be empty');
  }

  return PlantDisease.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();
}

async function deletePlantDisease(id) {
  if (!id) throw new Error('PlantDisease ID is required');
  return PlantDisease.findByIdAndDelete(id);
}

module.exports = {
  getAllPlantDiseases,
  getPlantDiseaseById,
  createPlantDisease,
  updatePlantDisease,
  deletePlantDisease,
};
