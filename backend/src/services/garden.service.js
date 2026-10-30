const UserPlant = require("../models/userPlant.model");
const Plant = require("../models/plant.model");
const PlantCategory = require("../models/plantCategory.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const validate = require("../validators/garden.validator");

const notFound = () => new AppError("GARDEN_PLANT_NOT_FOUND", 404, "Không tìm thấy cây trong vườn.");
const category = async (id) => {
  const item = await PlantCategory.findOne({ _id: id, is_published: true }).lean();
  if (!item) throw new AppError("CATEGORY_NOT_FOUND", 404, "Không tìm thấy danh mục công khai.");
  return item;
};
const present = (plant) => ({
  ...plant,
  acquisition_date: plant.acquisition_date ? plant.acquisition_date.toISOString().slice(0, 10) : null,
  species_name: plant.custom_species_name || plant.species_snapshot.common_name,
  category: { _id: plant.category_id, category_name: plant.species_snapshot.category_name },
  display_image_url: plant.plant_image_url || plant.species_snapshot.plant_image_url || "",
  next_routine: null,
});

const list = async (userId, input) => {
  const { page, limit, search, health_status, category_id, archived } = validate.query(input);
  const filter = { user_id: userId, archived_at: archived ? { $ne: null } : null };
  if (search) filter.plant_nickname = new RegExp(v.escapeRegex(search), "i");
  if (health_status && health_status !== "all") filter.health_status = health_status;
  if (category_id) filter.category_id = category_id;
  const [plants, total] = await Promise.all([
    UserPlant.find(filter).sort({ created_at: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    UserPlant.countDocuments(filter),
  ]);
  return { plants: plants.map(present), total, page, limit, totalPages: Math.ceil(total / limit) };
};
const create = async (userId, input) => {
  const data = validate.payload(input, true);
  let snapshot;
  if (data.plant_id) {
    if (data.custom_species_name !== undefined || data.category_id !== undefined)
      v.invalid("plant_id", "Cây thư viện không nhận thông tin loài hoặc danh mục nhập tay.");
    const plant = await Plant.findOne({ _id: data.plant_id, is_published: true }).lean();
    if (!plant) throw new AppError("PLANT_NOT_FOUND", 404, "Không tìm thấy cây công khai trong thư viện.");
    const group = await category(plant.category_id);
    data.category_id = plant.category_id;
    snapshot = { common_name: plant.common_name, category_name: group.category_name, plant_image_url: plant.plant_image };
  } else {
    const group = await category(data.category_id);
    snapshot = { common_name: data.custom_species_name, category_name: group.category_name, plant_image_url: "" };
  }
  const plant = await UserPlant.create({ ...data, user_id: userId, species_snapshot: snapshot });
  return present(plant.toObject());
};
const detail = async (userId, id) => {
  v.id(id);
  const plant = await UserPlant.findOne({ _id: id, user_id: userId }).lean();
  if (!plant) throw notFound();
  return present(plant);
};
const update = async (userId, id, input) => {
  v.id(id);
  const data = validate.payload(input);
  const current = await UserPlant.findOne({ _id: id, user_id: userId }).lean();
  if (!current) throw notFound();
  if (current.archived_at) throw new AppError("PLANT_ARCHIVED", 400, "Không thể sửa cây đã lưu trữ.");
  if (current.plant_id && (data.custom_species_name !== undefined || data.category_id !== undefined))
    v.invalid("plant_id", "Không thể thay đổi loài hoặc danh mục của cây thư viện.");
  if (data.category_id) {
    const group = await category(data.category_id);
    data["species_snapshot.category_name"] = group.category_name;
  }
  if (data.custom_species_name) data["species_snapshot.common_name"] = data.custom_species_name;
  const plant = await UserPlant.findOneAndUpdate(
    { _id: id, user_id: userId, archived_at: null },
    { $set: data }, { new: true, runValidators: true },
  ).lean();
  if (!plant) throw new AppError("PLANT_ARCHIVED", 400, "Cây không còn khả dụng để cập nhật.");
  return present(plant);
};
const archive = async (userId, id) => {
  v.id(id);
  const plant = await UserPlant.findOneAndUpdate(
    { _id: id, user_id: userId, archived_at: null },
    { $set: { archived_at: new Date() } }, { new: true, runValidators: true },
  ).lean();
  return plant ? present(plant) : detail(userId, id);
};

module.exports = { list, create, detail, update, archive };
