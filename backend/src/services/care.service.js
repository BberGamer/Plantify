const Care = require("../models/careSchedule.model");
const Completion = require("../models/careCompletion.model");
const UserPlant = require("../models/userPlant.model");
const Treatment = require("../models/treatmentSchedule.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const recurrence = require("./careRecurrence");
const unavailable = () => new AppError("CARE_UNAVAILABLE", 409, "Lịch đã dừng, cây đã lưu trữ hoặc đang điều trị. Vui lòng tải lại lịch.");
async function plant(userId, id) {
  v.id(id);
  const item = await UserPlant.findOne({ _id: id, user_id: userId, archived_at: null }).lean();
  if (!item) throw new AppError("GARDEN_PLANT_NOT_FOUND", 404, "Không tìm thấy cây trong vườn.");
  return item;
}
async function treating(userId, id) {
  return Treatment.exists({ user_id: userId, user_plant_id: id, status: "in_progress" });
}
async function create(userId, input) {
  v.object(input);
  await plant(userId, input.user_plant_id);
  if (await treating(userId, input.user_plant_id)) throw unavailable();
  if (!["watering", "fertilizing"].includes(input.action_type)) v.invalid("action_type", "Chọn tưới nước hoặc bón phân.");
  const title = v.text(input.title, "title");
  if (title.length > 200) v.invalid("title");
  const start = recurrence.date(input.start_date, "start_date");
  const end = input.end_date ? recurrence.date(input.end_date, "end_date") : null;
  if (end && end < start) v.invalid("end_date", "Ngày kết thúc phải từ ngày bắt đầu trở đi.");
  if (typeof input.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) v.invalid("time", "Giờ phải có dạng HH:mm.");
  if (!Number.isInteger(input.repeat_every_days) || input.repeat_every_days < 1 || input.repeat_every_days > 365)
    v.invalid("repeat_every_days", "Chu kỳ phải là số nguyên từ 1 đến 365 ngày.");
  const notes = input.notes === undefined ? "" : v.text(input.notes, "notes", false);
  if (notes.length > 1000) v.invalid("notes");
  return Care.create({ user_id: userId, user_plant_id: input.user_plant_id, action_type: input.action_type,
    title, start_date: start, end_date: end, time: input.time, repeat_every_days: input.repeat_every_days, notes });
}
async function list(userId, query) {
  const days = recurrence.dates(query.from, query.to);
  const filter = { user_id: userId, is_active: true, start_date: { $ne: null, $lte: query.to } };
  if (query.user_plant_id) { v.id(query.user_plant_id); filter.user_plant_id = query.user_plant_id; }
  const schedules = await Care.find(filter).populate("user_plant_id", "plant_nickname archived_at").lean();
  const completions = await Completion.find({ user_id: userId, schedule_id: { $in: schedules.map(s => s._id) }, date: { $gte: query.from, $lte: query.to } }).lean();
  const completed = new Map(completions.map(c => [`${c.schedule_id}:${c.date}`, c.completed_at]));
  const activeTreatments = await Treatment.find({ user_id: userId, status: "in_progress" }).select("user_plant_id").lean();
  const treatingIds = new Set(activeTreatments.map(t => String(t.user_plant_id)));
  const tasks = [];
  for (const s of schedules) {
    if (!s.user_plant_id || s.user_plant_id.archived_at) continue;
    const paused = s.is_paused || treatingIds.has(String(s.user_plant_id._id));
    for (const day of days) if (recurrence.occurs(s, day)) {
      const completedAt = completed.get(`${s._id}:${day}`);
      tasks.push({ schedule_id: s._id, date: day, time: s.time, title: s.title, notes: s.notes,
        action_type: s.action_type, repeat_every_days: s.repeat_every_days, plant_name: s.user_plant_id.plant_nickname,
        user_plant_id: s.user_plant_id._id, status: completedAt ? "completed" : paused ? "paused" : "pending", completed_at: completedAt || null });
    }
  }
  tasks.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  return { tasks };
}
async function complete(userId, id, input) {
  v.id(id); v.object(input);
  const day = recurrence.date(input.date);
  const schedule = await Care.findOne({ _id: id, user_id: userId, is_active: true }).lean();
  if (!schedule) throw new AppError("CARE_NOT_FOUND", 404, "Không tìm thấy lịch chăm sóc.");
  await plant(userId, String(schedule.user_plant_id));
  if (schedule.is_paused || await treating(userId, schedule.user_plant_id)) throw unavailable();
  if (!recurrence.occurs(schedule, day)) v.invalid("date", "Ngày này không có công việc trong lịch.");
  // Use the garden's Vietnam calendar day, independently of the server timezone.
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  if (day > today) v.invalid("date", "Chưa thể hoàn thành công việc trong tương lai.");
  try {
    return await Completion.findOneAndUpdate({ schedule_id: id, date: day, user_id: userId },
      { $setOnInsert: { completed_at: new Date() } }, { upsert: true, new: true, runValidators: true });
  } catch (error) {
    if (error.code === 11000) return Completion.findOne({ schedule_id: id, date: day, user_id: userId });
    throw error;
  }
}
async function remove(userId, id) {
  v.id(id);
  const result = await Care.findOneAndUpdate({ _id: id, user_id: userId }, { $set: { is_active: false } }, { new: true });
  if (!result) throw new AppError("CARE_NOT_FOUND", 404, "Không tìm thấy lịch chăm sóc.");
  return result;
}
module.exports = { create, list, complete, remove };
