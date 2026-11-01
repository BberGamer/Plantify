const UserPlant = require("../models/userPlant.model");
const Plant = require("../models/plant.model");
const PlantCategory = require("../models/plantCategory.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const validate = require("../validators/garden.validator");
const TreatmentSchedule = require("../models/treatmentSchedule.model");

const notFound = () => new AppError("GARDEN_PLANT_NOT_FOUND", 404, "Không tìm thấy cây trong vườn.");
const category = async (id) => {
  const item = await PlantCategory.findOne({ _id: id, is_published: true }).lean();
  if (!item) throw new AppError("CATEGORY_NOT_FOUND", 404, "Không tìm thấy danh mục công khai.");
  return item;
};
const treatmentSummary = (schedule) => {
  if (!schedule) return null;
  const tasks = schedule.tasks || [];
  const completed = tasks.filter((task) => task.status === "completed").length;
  const nextTask = tasks
    .filter((task) => task.status === "pending")
    .sort((left, right) => new Date(left.scheduled_date) - new Date(right.scheduled_date))[0];
  const duration = schedule.protocol_snapshot?.duration_days || 0;
  const started = new Date(schedule.start_date);
  const today = new Date();
  const currentDay = Math.max(
    1,
    Math.min(duration, Math.floor((today - started) / (24 * 60 * 60 * 1000)) + 1),
  );
  return {
    _id: schedule._id,
    status: schedule.status,
    disease_id: schedule.disease_id,
    current_day: currentDay,
    duration_days: duration,
    current_stage: schedule.current_stage,
    completed_tasks: completed,
    total_tasks: tasks.length,
    next_task: nextTask
      ? {
          _id: nextTask._id,
          title: nextTask.title,
          scheduled_date: nextTask.scheduled_date,
        }
      : null,
  };
};
const present = (plant, activeTreatment) => ({
  ...plant,
  acquisition_date: plant.acquisition_date ? plant.acquisition_date.toISOString().slice(0, 10) : null,
  species_name: plant.custom_species_name || plant.species_snapshot.common_name,
  category: { _id: plant.category_id, category_name: plant.species_snapshot.category_name },
  display_image_url: plant.plant_image_url || plant.species_snapshot.plant_image_url || "",
  active_treatment: treatmentSummary(activeTreatment),
  next_routine: activeTreatment
    ? treatmentSummary(activeTreatment)?.next_task
    : null,
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
  const schedules = plants.length
    ? await TreatmentSchedule.find({
        user_id: userId,
        user_plant_id: { $in: plants.map((plant) => plant._id) },
        status: "in_progress",
      }).lean()
    : [];
  const byPlant = new Map(
    schedules.map((schedule) => [String(schedule.user_plant_id), schedule]),
  );
  return {
    plants: plants.map((plant) => present(plant, byPlant.get(String(plant._id)))),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
  return present(plant.toObject(), null);
};
const detail = async (userId, id) => {
  v.id(id);
  const plant = await UserPlant.findOne({ _id: id, user_id: userId }).lean();
  if (!plant) throw notFound();
  const active = await TreatmentSchedule.findOne({
    user_id: userId,
    user_plant_id: id,
    status: "in_progress",
  }).lean();
  return present(plant, active);
};
const update = async (userId, id, input) => {
  v.id(id);
  const data = validate.payload(input);
  const current = await UserPlant.findOne({ _id: id, user_id: userId }).lean();
  if (!current) throw notFound();
  if (current.archived_at) throw new AppError("PLANT_ARCHIVED", 400, "Không thể sửa cây đã lưu trữ.");
  const activeTreatment = await TreatmentSchedule.findOne({
    user_id: userId,
    user_plant_id: id,
    status: "in_progress",
  }).lean();
  if (activeTreatment && data.health_status && data.health_status !== "treatment")
    throw new AppError(
      "ACTIVE_TREATMENT_EXISTS",
      409,
      "Không thể đổi trạng thái sức khỏe khi cây đang điều trị.",
    );
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
  return present(plant, activeTreatment);
};
const archive = async (userId, id) => {
  v.id(id);
  const activeTreatment = await TreatmentSchedule.exists({
    user_id: userId,
    user_plant_id: id,
    status: "in_progress",
  });
  if (activeTreatment)
    throw new AppError(
      "ACTIVE_TREATMENT_EXISTS",
      409,
      "Hãy kết thúc đợt điều trị trước khi lưu trữ cây.",
    );
  const plant = await UserPlant.findOneAndUpdate(
    { _id: id, user_id: userId, archived_at: null },
    { $set: { archived_at: new Date() } }, { new: true, runValidators: true },
  ).lean();
  return plant ? present(plant, null) : detail(userId, id);
};

module.exports = { list, create, detail, update, archive };
