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
  try {
    await FavoritePlant.updateOne({ user_id: userId, plant_id: plantId },
      { $setOnInsert: { user_id: userId, plant_id: plantId } }, { upsert: true, runValidators: true });
  } catch (error) {
    // Hai PUT đồng thời vẫn trả thành công khi cùng một cặp đã được lưu.
    if (error.code !== 11000 || !await FavoritePlant.exists({ user_id: userId, plant_id: plantId })) throw error;
  }
  return { plant_id: plantId, is_favorite: true };
};

const remove = async (userId, plantId) => {
  v.id(userId, "user_id");
  v.id(plantId, "plant_id");
  await FavoritePlant.deleteOne({ user_id: userId, plant_id: plantId });
  return { plant_id: plantId, is_favorite: false };
};

module.exports = { list, status, add, remove };
