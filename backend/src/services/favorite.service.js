const mongoose = require("mongoose");
const FavoritePlant = require("../models/favoritePlant.model");
const Plant = require("../models/plant.model");
const validate = require("../validators/favorite.validator");
const v = require("../validators/common");
const AppError = require("../utils/app-error");

const list = async (userId, input) => {
  v.id(userId, "user_id");
  const { page, limit } = validate.query(input);
  // Lọc cây đã xóa/ẩn trước khi đếm và phân trang để không có trang rỗng giả.
  const [result] = await FavoritePlant.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    { $lookup: { from: Plant.collection.name, localField: "plant_id", foreignField: "_id", as: "plant" } },
    { $unwind: "$plant" },
    { $match: { "plant.is_published": true } },
    { $sort: { created_at: -1, _id: -1 } },
    { $facet: {
      plants: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $replaceRoot: { newRoot: "$plant" } }],
      count: [{ $count: "total" }],
    } },
  ]);
  const plants = await Plant.populate(result?.plants || [], { path: "category_id", select: "category_name category_image" });
  const total = result?.count[0]?.total || 0;
  return { plants, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const status = async (userId, input) => {
  v.id(userId, "user_id");
  const ids = validate.ids(input.ids);
  const plants = await Plant.find({ _id: { $in: ids }, is_published: true }).select("_id").lean();
  const favorites = await FavoritePlant.find({ user_id: userId, plant_id: { $in: plants.map((plant) => plant._id) } })
    .select("plant_id").lean();
  return { favorite_ids: favorites.map((favorite) => String(favorite.plant_id)) };
};

const add = async (userId, plantId) => {
  v.id(userId, "user_id");
  v.id(plantId, "plant_id");
  if (!await Plant.exists({ _id: plantId, is_published: true }))
    throw new AppError("PLANT_NOT_FOUND", 404, "Cây không còn trong danh mục công khai.");
  await FavoritePlant.init();
  if (await FavoritePlant.exists({ user_id: userId, plant_id: plantId })) {
    return { plant_id: plantId, is_favorite: true };
  }
  const saved = await FavoritePlant.find({ user_id: userId }).select("free_slot").lean();
  // Bản ghi cũ chưa có slot vẫn chiếm hạn mức, không cần sửa dữ liệu cũ.
  const legacyCount = saved.filter((item) => item.free_slot === undefined).length;
  const occupied = new Set(saved.map((item) => item.free_slot));
  for (let slot = legacyCount; slot < 5 && saved.length < 5; slot++) {
    if (occupied.has(slot)) continue;
    try {
      await FavoritePlant.create({ user_id: userId, plant_id: plantId, free_slot: slot });
      return { plant_id: plantId, is_favorite: true };
    } catch (error) {
      if (error.code !== 11000) throw error;
      // Unique index chặn hai yêu cầu khác cây chiếm cùng slot.
      if (await FavoritePlant.exists({ user_id: userId, plant_id: plantId })) {
        return { plant_id: plantId, is_favorite: true };
      }
    }
  }
  throw new AppError("FAVORITE_LIMIT_REACHED", 409,
    "Tài khoản Free chỉ được lưu tối đa 5 cây yêu thích. Hãy bỏ một cây trước khi thêm cây mới.");
};

const remove = async (userId, plantId) => {
  v.id(userId, "user_id");
  v.id(plantId, "plant_id");
  await FavoritePlant.deleteOne({ user_id: userId, plant_id: plantId });
  return { plant_id: plantId, is_favorite: false };
};

module.exports = { list, status, add, remove };
