const AppError = require("../utils/app-error");
const v = require("../validators/common");
const validate = require("../validators/plant.validator");
// services/plant.service.js - Business logic cho Plants & PlantCategories
const Plant = require("../models/plant.model");
const PlantCategory = require("../models/plantCategory.model");

const assertCategory = async (categoryId) => {
  if (!(await PlantCategory.exists({ _id: categoryId }))) {
    throw new AppError(
      "CATEGORY_NOT_FOUND",
      404,
      "Không tìm thấy danh mục cây.",
    );
  }
};

const plantService = {
  /**
   * Lay danh sach tat ca danh muc cay (is_published = true)
   */
  getAllCategories: async () => {
    return PlantCategory.find({ is_published: true }).sort({
      category_name: 1,
    });
  },

  /**
   * Lay danh sach cay co phan trang, loc theo danh muc, tim kiem theo ten
   * @param {object} query - { category_id, search, page, limit }
   */
  getAllPlants: async (query = {}) => {
    const { category_id, search, page, limit } = validate.query(query);
    const filter = { is_published: true };

    if (category_id) {
      filter.category_id = category_id;
    }

    if (search && search.trim()) {
      const regex = new RegExp(v.escapeRegex(search.trim()), "i");
      filter.$or = [{ common_name: regex }, { scientific_name: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [plants, total] = await Promise.all([
      Plant.find(filter)
        .populate("category_id", "category_name category_image")
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
    v.id(id);
    const plant = await Plant.findOne({ _id: id, is_published: true }).populate(
      "category_id",
      "category_name scientific_reference category_image",
    );

    if (!plant) {
      throw new AppError("PLANT_NOT_FOUND", 404, "Không tìm thấy cây này.");
    }

    return plant;
  },

  getManagerPlants: async (query = {}) => {
    const { search, page, limit } = validate.query(query);
    const filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(v.escapeRegex(search.trim()), "i");
      filter.$or = [{ common_name: regex }, { scientific_name: regex }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [plants, total] = await Promise.all([
      Plant.find(filter)
        .populate("category_id", "category_name")
        .sort({ updated_at: -1 })
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

  createPlant: async (data) => {
    data = validate.payload(data, true);
    await assertCategory(data.category_id);
    const plant = await Plant.create(data);
    return plant.populate("category_id", "category_name");
  },

  updatePlant: async (id, data) => {
    v.id(id);
    data = validate.payload(data);
    if (data.category_id !== undefined) await assertCategory(data.category_id);
    const plant = await Plant.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).populate("category_id", "category_name");
    if (!plant) {
      throw new AppError("PLANT_NOT_FOUND", 404, "Không tìm thấy cây này.");
    }
    return plant;
  },

  deletePlant: async (id) => {
    v.id(id);
    const plant = await Plant.findByIdAndDelete(id);
    if (!plant) {
      throw new AppError("PLANT_NOT_FOUND", 404, "Không tìm thấy cây này.");
    }
    return plant;
  },
};

module.exports = plantService;
