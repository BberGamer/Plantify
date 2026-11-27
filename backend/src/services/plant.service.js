const withTransactionResult = require("../utils/transaction-result");
const catalogAi = require("./catalog-ai.service");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const validate = require("../validators/plant.validator");
const { imageFields, catalogImageUrls } = require("./catalog-photo.service");
// services/plant.service.js - Business logic cho Plants & PlantCategories
const Plant = require("../models/plant.model");
const PlantCategory = require("../models/plantCategory.model");
const UserPlant = require("../models/userPlant.model");
const FavoritePlant = require("../models/favoritePlant.model");
const TreatmentProtocol = require("../models/treatmentProtocol.model");

const assertCategory = async (categoryId, session) => {
  if (!(await PlantCategory.exists({ _id: categoryId }).session(session))) {
    throw new AppError(
      "CATEGORY_NOT_FOUND",
      404,
      "Không tìm thấy danh mục cây.",
    );
  }
};

const plantService = {
  getManagerPlantById: async (id) => {
    v.id(id);
    const plant = await Plant.findById(id).populate("category_id", "category_name").lean();
    if (!plant) throw new AppError("PLANT_NOT_FOUND", 404, "Không tìm thấy cây này.");
    const { example_images, ...detail } = plant;
    return { ...detail, image_urls: catalogImageUrls(plant, "plant_image") };
  },
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

  createPlant: async (input) => {
    const ids = await catalogAi.validateIds(input?.ai_class_ids);
    const data = validate.payload(input, true);
    return withTransactionResult(async session => {
      await assertCategory(data.category_id, session);
      const [plant] = await Plant.create([
        { ...data, ...imageFields(data, null, "plant_image") },
      ], { session });
      await catalogAi.synchronize("plant", plant, ids, session);
      return Plant.findById(plant._id).session(session).populate("category_id", "category_name");
    });
  },
  updatePlant: async (id, input) => {
    v.id(id);
    const ids = await catalogAi.validateIds(input?.ai_class_ids);
    const data = validate.payload(input);
    return withTransactionResult(async session => {
      const plant = await Plant.findById(id).session(session);
      if (!plant) throw new AppError("PLANT_NOT_FOUND", 404, "Không tìm thấy cây này.");
      if (data.category_id !== undefined) await assertCategory(data.category_id, session);
      Object.assign(plant, data, imageFields(data, plant, "plant_image"));
      await plant.save({ session });
      await catalogAi.synchronize("plant", plant, ids, session);
      return Plant.findById(id).session(session).populate("category_id", "category_name");
    });
  },
  deletePlant: async (id) => {
    v.id(id);
    return withTransactionResult(async session => {
      const plant = await Plant.findById(id).session(session);
      if (!plant) throw new AppError("PLANT_NOT_FOUND", 404, "Không tìm thấy cây này.");
      await catalogAi.assertCanDelete("plant", id, session);
      if (await UserPlant.exists({ plant_id: id }).session(session) ||
          await FavoritePlant.exists({ plant_id: id }).session(session) ||
          await TreatmentProtocol.exists({ plant_ids: id }).session(session))
        throw new AppError("CATALOG_IN_USE", 409, "Cây đang có trong vườn, danh sách yêu thích hoặc phác đồ. Hãy tạm ẩn thay vì xóa.");
      await Plant.deleteOne({ _id: id }, { session });
      return plant;
    });
  },

};

module.exports = plantService;
