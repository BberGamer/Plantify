// Business logic cho Care Guides.
const CareGuide = require('./careGuide.model');

const CARE_GUIDE_FIELDS = ['plantId', 'pruning', 'propagation', 'watering', 'repotting'];

function pickCareGuideFields(data = {}) {
  return CARE_GUIDE_FIELDS.reduce((result, field) => {
    if (data[field] !== undefined) result[field] = data[field];
    return result;
  }, {});
}

async function getAllCareGuides(filters = {}) {
  const { plantId, search, sort, page = 1, limit = 10 } = filters;
  const query = {};

  if (plantId) query.plantId = plantId;

  const keyword = String(search || '').trim();
  if (keyword) {
    query.$or = ['pruning', 'propagation', 'watering', 'repotting'].map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    }));
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 200);
  const total = await CareGuide.countDocuments(query);
  const pages = Math.max(Math.ceil(total / safeLimit), 1);
  const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const careGuides = await CareGuide.find(query)
    .sort(sortOption)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return { careGuides, total, pages, currentPage: safePage };
}

async function getCareGuideById(id) {
  if (!id) throw new Error('CareGuide ID is required');
  return CareGuide.findById(id).lean();
}

async function createCareGuide(data) {
  if (!data.plantId) {
    throw new Error('Plant ID is required');
  }

  const careGuide = new CareGuide(pickCareGuideFields(data));
  return careGuide.save();
}

async function updateCareGuide(id, data) {
  if (!id) throw new Error('CareGuide ID is required');

  const updateData = pickCareGuideFields(data);
  if (updateData.plantId !== undefined && !updateData.plantId) {
    throw new Error('Plant ID cannot be empty');
  }

  return CareGuide.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();
}

async function deleteCareGuide(id) {
  if (!id) throw new Error('CareGuide ID is required');
  return CareGuide.findByIdAndDelete(id);
}

module.exports = {
  getAllCareGuides,
  getCareGuideById,
  createCareGuide,
  updateCareGuide,
  deleteCareGuide,
};
