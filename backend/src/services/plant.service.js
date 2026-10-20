// services/plant.service.js - Business logic cho Plants & PlantCategories
const Plant = require('../models/plant.model');
const PlantCategory = require('../models/plantCategory.model');

const plantService = {
  /**
   * Lay danh sach tat ca danh muc cay (is_published = true)
   */
  getAllCategories: async () => {
    return PlantCategory.find({ is_published: true }).sort({ category_name: 1 });
  },

  /**
   * Lay danh sach cay co phan trang, loc theo danh muc, tim kiem theo ten
   * @param {object} query - { category_id, search, page, limit }
   */
  getAllPlants: async ({ category_id, search, page = 1, limit = 20 } = {}) => {
    const filter = { is_published: true };

    if (category_id) {
      filter.category_id = category_id;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ common_name: regex }, { scientific_name: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [plants, total] = await Promise.all([
      Plant.find(filter)
        .populate('category_id', 'category_name category_image')
        .sort({ common_name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Plant.countDocuments(filter),
    ]);

    return {
      plants,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  },

  /**
   * Lay chi tiet mot cay theo ID
   * @param {string} id - ObjectId cua cay
   */
  getPlantById: async (id) => {
    const plant = await Plant.findOne({ _id: id, is_published: true }).populate(
      'category_id',
      'category_name scientific_reference category_image'
    );

    if (!plant) {
      const err = new Error('Không tìm thấy cây này.');
      err.statusCode = 404;
      throw err;
    }

    return plant;
  },

  getManagerPlants: async ({ search, page = 1, limit = 20 } = {}) => {
    const filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ common_name: regex }, { scientific_name: regex }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [plants, total] = await Promise.all([
      Plant.find(filter).populate('category_id', 'category_name').sort({ updated_at: -1 }).skip(skip).limit(Number(limit)),
      Plant.countDocuments(filter),
    ]);
    return { plants, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  },

  createPlant: async (data) => {
    const plant = await Plant.create(data);
    return plant.populate('category_id', 'category_name');
  },

  updatePlant: async (id, data) => {
    const plant = await Plant.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('category_id', 'category_name');
    if (!plant) {
      const err = new Error('Không tìm thấy cây này.');
      err.statusCode = 404;
      throw err;
    }
    return plant;
  },

  deletePlant: async (id) => {
    const plant = await Plant.findByIdAndDelete(id);
    if (!plant) {
      const err = new Error('Không tìm thấy cây này.');
      err.statusCode = 404;
      throw err;
    }
    return plant;
  },
};

module.exports = plantService;
