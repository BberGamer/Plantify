const { randomBytes } = require("node:crypto");
const jwt = require("jsonwebtoken");
const Care = require("../models/careSchedule.model");
const Completion = require("../models/careCompletion.model");
const Plant = require("../models/plant.model");
const UserPlant = require("../models/userPlant.model");
const Treatment = require("../models/treatmentSchedule.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const recurrence = require("./careRecurrence");
const withTransactionResult = require("../utils/transaction-result");
const careAi = require("./care-ai.service");
const { assertCareCandidate, savePlanSelection, validateCandidateRank } = require("./diagnosis.service");
const ACTIONS = ["watering", "fertilizing"];
const PREVIEW_AUDIENCE = "plantify:care-preview";
const PREVIEW_TTL = 30 * 60;
const localPreviewKey = randomBytes(32);
const previewSecret = () => process.env.JWT_SECRET || localPreviewKey;
const unavailable = () =>
  new AppError(
    "CARE_UNAVAILABLE",
    409,
    "Lịch đã dừng, cây đã lưu trữ hoặc đang điều trị. Vui lòng tải lại lịch.",
  );
async function plant(userId, id) {
  v.id(id);
  const item = await UserPlant.findOne({
    _id: id,
    user_id: userId,
    archived_at: null,
  }).lean();
  if (!item)
    throw new AppError(
      "GARDEN_PLANT_NOT_FOUND",
      404,
      "Không tìm thấy cây trong vườn.",
    );
  return item;
}
async function treating(userId, id, session = null) {
  return Treatment.exists({
    user_id: userId,
    user_plant_id: id,
    status: "in_progress",
  }).session(session);
}
// Ghi vào cây trong cùng transaction với lịch để tuần tự hóa việc tạo lịch và đổi trạng thái cây.
async function lockPlant(userId, id, session) {
  const updated = await UserPlant.findOneAndUpdate(
    { _id: id, user_id: userId, archived_at: null },
    { $inc: { __v: 1 } },
    { session },
  ).lean();
  if (!updated)
    throw new AppError("GARDEN_PLANT_NOT_FOUND", 404, "Không tìm thấy cây trong vườn.");
  if (updated.is_under_treatment || await treating(userId, id, session))
    throw unavailable();
  return updated;
}
async function create(userId, input) {
  v.object(input);
  v.id(input.user_plant_id, "user_plant_id");
  if (!ACTIONS.includes(input.action_type))
    v.invalid("action_type", "Chọn tưới nước hoặc bón phân.");
  const title = v.text(input.title, "title");
  if (title.length > 200) v.invalid("title");
  const start = recurrence.date(input.start_date, "start_date");
  const end = input.end_date
    ? recurrence.date(input.end_date, "end_date")
    : null;
  if (end && end < start)
    v.invalid("end_date", "Ngày kết thúc phải từ ngày bắt đầu trở đi.");
  if (!recurrence.isTime(input.time))
    v.invalid("time", "Giờ phải có dạng HH:mm.");
  if (
    !Number.isInteger(input.repeat_every_days) ||
    input.repeat_every_days < 1 ||
    input.repeat_every_days > 365
  )
    v.invalid(
      "repeat_every_days",
      "Chu kỳ phải là số nguyên từ 1 đến 365 ngày.",
    );
  const notes =
    input.notes === undefined ? "" : v.text(input.notes, "notes", false);
  if (notes.length > 1000) v.invalid("notes");
  return withTransactionResult(async (session) => {
    await lockPlant(userId, input.user_plant_id, session);
    const [created] = await Care.create([{
      user_id: userId,
      user_plant_id: input.user_plant_id,
      action_type: input.action_type,
      title,
      start_date: start,
      end_date: end,
      time: input.time,
      repeat_every_days: input.repeat_every_days,
      notes,
    }], { session });
    return created;
  });
}

function activeSchedules(userId, plantId, today, actions, session = null) {
  return Care.find({
    user_id: userId,
    user_plant_id: plantId,
    action_type: { $in: actions },
    is_active: true,
    start_date: { $ne: null },
    $or: [{ end_date: null }, { end_date: { $gte: today } }],
  }).session(session).lean();
}

function upcomingDate(schedules, today) {
  return schedules.map((schedule) => {
    if (schedule.start_date >= today) return schedule.start_date;
    const passedDays = (Date.parse(today) - Date.parse(schedule.start_date)) / 86400000;
    const interval = schedule.repeat_every_days || 1;
    const next = recurrence.shiftDate(
      schedule.start_date,
      Math.ceil(passedDays / interval) * interval,
    );
    return !schedule.end_date || next <= schedule.end_date ? next : null;
  }).filter(Boolean).sort()[0] || today;
}

const coversRule = (schedule, rule) => schedule.action_type === rule.action_type &&
  (rule.action_type !== "inspection" || (schedule.repeat_every_days === 1 && !schedule.end_date));

function diagnosisSelection(input) {
  const diagnosisId = input.diagnosis_id === undefined ? undefined :
    v.id(input.diagnosis_id, "diagnosis_id");
  const rank = validateCandidateRank(input.candidate_rank);
  if (rank !== undefined && !diagnosisId) v.invalid("diagnosis_id");
  return { diagnosisId, rank };
}

async function preview(userId, input) {
  v.object(input);
  const plantId = v.id(input.plant_id, "plant_id");
  const selection = diagnosisSelection(input);
  const catalog = await Plant.findOne({ _id: plantId, is_published: true })
    .select("common_name").lean();
  if (!catalog?.common_name)
    throw new AppError("CARE_PLANT_NOT_FOUND", 404, "Không tìm thấy cây đang công khai trong danh mục.");
  await assertCareCandidate(selection.diagnosisId, userId, catalog._id, selection.rank);

  const { rules, sources, reference_kind } = await careAi.loadReference(catalog.common_name);
  const { tasks, timing_source } = await careAi.scheduleReference({ species_snapshot: catalog }, rules);
  tasks.sort((left, right) => left.time.localeCompare(right.time));
  const plan = { tasks, sources, reference_kind, timing_source };
  const preview_token = jwt.sign({ plantId: String(catalog._id), selection, plan }, previewSecret(), {
    algorithm: "HS256", audience: PREVIEW_AUDIENCE, subject: userId, expiresIn: PREVIEW_TTL,
  });
  return { ...plan, plant_name: catalog.common_name, preview_token, expires_in_seconds: PREVIEW_TTL };
}

async function applyPreview(userId, input) {
  v.object(input);
  const id = v.id(input.user_plant_id, "user_plant_id");
  const token = v.text(input.preview_token, "preview_token");
  if (token.length > 50000) v.invalid("preview_token");
  let draft;
  try {
    draft = jwt.verify(token, previewSecret(), { algorithms: ["HS256"], audience: PREVIEW_AUDIENCE });
  } catch (failure) {
    if (failure instanceof jwt.TokenExpiredError)
      throw new AppError("CARE_PREVIEW_EXPIRED", 409, "Bản xem trước đã hết hạn. Hãy tạo lại để áp dụng.");
    throw new AppError("CARE_PREVIEW_INVALID", 400, "Bản xem trước lịch chăm sóc không hợp lệ.");
  }
  if (draft.sub !== userId)
    throw new AppError("CARE_PREVIEW_INVALID", 403, "Bản xem trước lịch chăm sóc không hợp lệ.");
  return saveReference(userId, id, draft.plantId, draft.selection, draft.plan);
}

async function createFromReference(userId, input) {
  v.object(input);
  const id = v.id(input.user_plant_id, "user_plant_id");
  const item = await plant(userId, id);
  const selection = diagnosisSelection(input);
  if (!item.plant_id || !item.species_snapshot?.common_name)
    v.invalid("user_plant_id", "Hãy chọn cây được thêm từ danh mục.");
  if (item.is_under_treatment || await treating(userId, id)) throw unavailable();
  await assertCareCandidate(selection.diagnosisId, userId, item.plant_id, selection.rank);

  const { rules, sources, reference_kind } = await careAi.loadReference(item.species_snapshot.common_name);
  const actions = rules.map((rule) => rule.action_type);
  const today = recurrence.localDateTime().slice(0, 10);
  const existing = await activeSchedules(userId, id, today, actions);
  const missing = rules.filter(
    (rule) => !existing.some((row) => coversRule(row, rule)),
  );
  const { tasks, timing_source } = missing.length
    ? await careAi.scheduleReference(item, missing)
    : { tasks: [], timing_source: null };
  return saveReference(userId, id, item.plant_id, selection, {
    tasks, rules, sources, reference_kind, timing_source,
  });
}

async function saveReference(userId, id, plantId, { diagnosisId, rank }, plan) {
  const { tasks, rules = tasks, sources, reference_kind, timing_source } = plan;
  const actions = rules.map((rule) => rule.action_type);
  return withTransactionResult(async (session) => {
    const ownedPlant = await lockPlant(userId, id, session);
    if (String(ownedPlant.plant_id) !== String(plantId))
      throw new AppError("CARE_PLANT_MISMATCH", 409, "Chọn cây cùng loài với bản xem trước lịch chăm sóc.");
    const diagnosis = await assertCareCandidate(diagnosisId, userId, ownedPlant.plant_id, rank, session);
    const now = recurrence.localDateTime();
    const day = now.slice(0, 10);
    const tomorrow = recurrence.shiftDate(day, 1);
    const schedules = await activeSchedules(userId, id, day, actions, session);
    const newTasks = tasks.filter(
      (task) => !schedules.some((row) => coversRule(row, task)),
    );
    let updatedCount = 0;
    for (const row of schedules) {
      // Chỉ cập nhật lịch cũ có đúng nội dung tài liệu tham khảo đã lưu trước đó.
      const reference = rules.find((rule) => coversRule(row, rule) &&
        rule.title === row.title && rule.notes === row.notes &&
        rule.repeat_every_days === row.repeat_every_days);
      if (!reference) continue;
      const changes = {};
      if (!row.steps?.length) {
        changes.steps = reference.steps;
        changes.dose_note = reference.dose_note;
      }
      if (row.action_type === "inspection" && row.start_date === tomorrow)
        changes.start_date = day;
      if (!Object.keys(changes).length) continue;
      await Care.updateOne({ _id: row._id }, { $set: changes }, { session });
      Object.assign(row, changes);
      updatedCount++;
    }
    const created = newTasks.length ? await Care.create(newTasks.map((task) => ({
      ...task,
      user_id: userId,
      user_plant_id: id,
      start_date: task.action_type === "inspection" || task.time >= now.slice(11, 16)
        ? day
        : tomorrow,
    })), { session }) : [];
    const applied = [...schedules, ...created];
    if (created.length || updatedCount)
      await savePlanSelection(diagnosis, "care", ownedPlant, null, rank, session);
    return {
      created_count: created.length,
      updated_count: updatedCount,
      date: upcomingDate(applied, day),
      schedules: applied.sort((a, b) => a.time.localeCompare(b.time)).map((row) => ({
        _id: row._id,
        action_type: row.action_type,
        title: row.title,
        time: row.time,
        start_date: row.start_date,
        repeat_every_days: row.repeat_every_days,
        notes: row.notes,
        steps: row.steps,
        dose_note: row.dose_note,
      })),
      sources,
      reference_kind,
      timing_source: created.length ? timing_source : null,
    };
  });
}
async function list(userId, query) {
  const days = recurrence.dates(query.from, query.to);
  const filter = {
    user_id: userId,
    is_active: true,
    start_date: { $ne: null, $lte: query.to },
  };
  if (query.user_plant_id) {
    v.id(query.user_plant_id);
    filter.user_plant_id = query.user_plant_id;
  }
  const schedules = await Care.find(filter)
    .populate({
      path: "user_plant_id",
      select: "plant_nickname archived_at",
      match: { user_id: userId },
    })
    .lean();
  const completions = await Completion.find({
    user_id: userId,
    schedule_id: { $in: schedules.map((s) => s._id) },
    date: { $gte: query.from, $lte: query.to },
  }).lean();
  const completed = new Map(
    completions.map((c) => [`${c.schedule_id}:${c.date}`, c.completed_at]),
  );
  const activeTreatments = await Treatment.find({
    user_id: userId,
    status: "in_progress",
  })
    .select("user_plant_id")
    .lean();
  const treatingIds = new Set(
    activeTreatments.map((t) => String(t.user_plant_id)),
  );
  const tasks = [];
  for (const s of schedules) {
    if (!s.user_plant_id || s.user_plant_id.archived_at) continue;
    const paused = s.is_paused || treatingIds.has(String(s.user_plant_id._id));
    for (const day of days)
      if (recurrence.occurs(s, day)) {
        const completedAt = completed.get(`${s._id}:${day}`);
        tasks.push({
          schedule_id: s._id,
          date: day,
          time: s.time,
          title: s.title,
          notes: s.notes,
          steps: s.steps,
          dose_note: s.dose_note,
          action_type: s.action_type,
          repeat_every_days: s.repeat_every_days,
          plant_name: s.user_plant_id.plant_nickname,
          user_plant_id: s.user_plant_id._id,
          status: completedAt ? "completed" : paused ? "paused" : "pending",
          completed_at: completedAt || null,
        });
      }
  }
  tasks.sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
  return { tasks };
}
async function complete(userId, id, input) {
  v.id(id);
  v.object(input);
  const day = recurrence.date(input.date);
  const schedule = await Care.findOne({
    _id: id,
    user_id: userId,
    is_active: true,
  }).lean();
  if (!schedule)
    throw new AppError("CARE_NOT_FOUND", 404, "Không tìm thấy lịch chăm sóc.");
  await plant(userId, String(schedule.user_plant_id));
  if (schedule.is_paused || (await treating(userId, schedule.user_plant_id)))
    throw unavailable();
  if (!recurrence.occurs(schedule, day))
    v.invalid("date", "Ngày này không có công việc trong lịch.");
  // Use the garden's Vietnam calendar day, independently of the server timezone.
  const today = recurrence.localDateTime().slice(0, 10);
  if (day > today)
    v.invalid("date", "Chưa thể hoàn thành công việc trong tương lai.");
  try {
    return await Completion.findOneAndUpdate(
      { schedule_id: id, date: day, user_id: userId },
      { $setOnInsert: { completed_at: new Date() } },
      { upsert: true, new: true, runValidators: true },
    );
  } catch (error) {
    if (error.code === 11000)
      return Completion.findOne({
        schedule_id: id,
        date: day,
        user_id: userId,
      });
    throw error;
  }
}
async function remove(userId, id) {
  v.id(id);
  const result = await Care.findOneAndUpdate(
    { _id: id, user_id: userId },
    { $set: { is_active: false } },
    { new: true },
  );
  if (!result)
    throw new AppError("CARE_NOT_FOUND", 404, "Không tìm thấy lịch chăm sóc.");
  return result;
}
module.exports = { create, preview, applyPreview, createFromReference, list, complete, remove };
