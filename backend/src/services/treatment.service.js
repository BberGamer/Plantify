const mongoose = require("mongoose");
const AppError = require("../utils/app-error");
const TreatmentProtocol = require("../models/treatmentProtocol.model");
const TreatmentSchedule = require("../models/treatmentSchedule.model");
const UserPlant = require("../models/userPlant.model");
const Disease = require("../models/disease.model");
const CareSchedule = require("../models/careSchedule.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const validate = require("../validators/treatment.validator");
const v = require("../validators/common");

const DAY_MS = 24 * 60 * 60 * 1000;
const terminalStatuses = ["recovered", "failed", "cancelled"];

const assertTransition = (current, next) => {
  const allowed =
    (current === "generated" && next === "in_progress") ||
    (current === "in_progress" && terminalStatuses.includes(next));
  if (!allowed)
    throw new AppError(
      "INVALID_TREATMENT_TRANSITION",
      409,
      "Chuyển trạng thái điều trị không hợp lệ.",
    );
};

const assertOutcomeRequirements = (schedule, outcome) => {
  if (
    outcome === "recovered" &&
    schedule.tasks.some((task) => task.status !== "completed")
  )
    throw new AppError(
      "TREATMENT_TASKS_INCOMPLETE",
      409,
      "Cần hoàn thành tất cả công việc trước khi ghi nhận cây đã hồi phục.",
    );
};

const createCarePauseSnapshot = (careSchedules) =>
  careSchedules.map((care) => ({
    care_schedule_id: care._id,
    was_paused: care.is_paused,
    previous_pause_reason: care.pause_reason || null,
  }));

const careScheduleIdsToPause = (careSchedules) =>
  careSchedules.filter((care) => !care.is_paused).map((care) => care._id);

const careScheduleIdsToResume = (snapshot) =>
  snapshot.filter((item) => !item.was_paused).map((item) => item.care_schedule_id);

const createReminderOperations = (schedule) =>
  schedule.tasks.map((task) => ({
    updateOne: {
      filter: { dedupe_key: `treatment:${schedule._id}:task:${task._id}` },
      update: {
        $setOnInsert: {
          user_id: schedule.user_id,
          treatment_schedule_id: schedule._id,
          treatment_task_id: task._id,
          type: "treatment",
          title: "Công việc điều trị hôm nay",
          message: task.title,
          scheduled_for: task.scheduled_date,
          status: "scheduled",
          dedupe_key: `treatment:${schedule._id}:task:${task._id}`,
        },
      },
      upsert: true,
    },
  }));

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);
const utcToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const createProtocolSnapshot = (protocol) => ({
  protocol_name: protocol.protocol_name,
  description: protocol.description,
  duration_days: protocol.duration_days,
  version: protocol.version,
  approved_instructions: [...protocol.approved_instructions],
  safety_guidelines: [...protocol.safety_guidelines],
  stages: protocol.stages.map((stage) => ({
    source_stage_id: stage._id,
    order: stage.order,
    title: stage.title,
    start_day: stage.start_day,
    end_day: stage.end_day,
    instructions: [...stage.instructions],
    dosage_note: stage.dosage_note || "",
    important_note: stage.important_note || "",
  })),
});

const createTasks = (protocol, startDate) =>
  protocol.stages
    .flatMap((stage) => {
      const tasks = [];
      for (let day = stage.start_day; day <= stage.end_day; day += 1) {
        tasks.push({
          stage_order: stage.order,
          title: stage.title,
          scheduled_date: addDays(startDate, day - 1),
          instructions: [...stage.instructions],
          important_note: stage.important_note || "",
          status: "pending",
        });
      }
      return tasks;
    })
    .sort((left, right) => left.scheduled_date - right.scheduled_date);

const progress = (schedule) => {
  const tasks = schedule.tasks || [];
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  return {
    completed_tasks: completedTasks,
    total_tasks: tasks.length,
    percent: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
  };
};

const presentSchedule = async (schedule, session) => {
  const value = schedule?.toObject ? schedule.toObject() : schedule;
  const [plant, disease] = await Promise.all([
    UserPlant.findById(value.user_plant_id)
      .session(session || null)
      .lean(),
    Disease.findById(value.disease_id)
      .select("disease_name typical_symptoms environmental_cause")
      .session(session || null)
      .lean(),
  ]);
  if (!plant || !disease)
    throw new AppError(
      "TREATMENT_REFERENCE_MISSING",
      409,
      "Dữ liệu cây hoặc bệnh của lịch điều trị không còn đầy đủ.",
    );
  const duration = value.protocol_snapshot.duration_days;
  const start = value.start_date ? new Date(value.start_date) : null;
  const elapsed = start ? Math.floor((utcToday() - start) / DAY_MS) + 1 : 0;
  const historyLabels = {
    generated: "Đã tạo lịch điều trị",
    activated: "Đã bắt đầu phác đồ điều trị",
    task_completed: "Đã hoàn thành công việc điều trị",
    task_rescheduled: "Đã đổi ngày công việc điều trị",
    recovered: "Đã ghi nhận cây hồi phục",
    failed: "Đã ghi nhận cây chưa hồi phục",
    cancelled: "Đã hủy đợt điều trị",
  };
  return {
    ...value,
    started_at: value.start_date,
    estimated_end_at: value.end_date,
    current_day:
      value.status === "generated" ? 0 : Math.max(1, Math.min(duration, elapsed)),
    current_stage_order: value.current_stage,
    protocol: {
      _id: String(value.treatment_protocol_id),
      protocol_name: value.protocol_snapshot.protocol_name,
      description: value.protocol_snapshot.description,
      standard_duration_days: duration,
      version: value.protocol_snapshot.version,
      safety_note: value.protocol_snapshot.safety_guidelines.join(" "),
      safety_guidelines: value.protocol_snapshot.safety_guidelines,
      approved_instructions: value.protocol_snapshot.approved_instructions,
    },
    stages: value.protocol_snapshot.stages,
    task_progress: value.tasks.map((task) => ({
      ...task,
      status:
        task.status === "pending" && new Date(task.scheduled_date) > new Date()
          ? "upcoming"
          : task.status,
      instructions: task.instructions.join(" "),
    })),
    history: (value.history || []).map((item) => ({
      ...item,
      title: item.note || historyLabels[item.event] || "Cập nhật điều trị",
    })),
    plant: {
      _id: String(plant._id),
      plant_nickname: plant.plant_nickname,
      species_name:
        plant.custom_species_name || plant.species_snapshot?.common_name || "",
      image_url:
        plant.plant_image_url || plant.species_snapshot?.plant_image_url || "",
    },
    disease: {
      _id: String(disease._id),
      disease_name: disease.disease_name,
      description: disease.typical_symptoms,
      environmental_cause: disease.environmental_cause || "",
    },
    progress: progress(value),
  };
};

const getOwnedPlant = async (userId, plantId, session) => {
  const plant = await UserPlant.findOne({
    _id: plantId,
    user_id: userId,
    archived_at: null,
  })
    .session(session || null)
    .lean();
  if (!plant)
    throw new AppError(
      "GARDEN_PLANT_NOT_FOUND",
      404,
      "Không tìm thấy cây khả dụng trong vườn của bạn.",
    );
  return plant;
};

const getApprovedProtocols = async (diseaseId) => {
  v.id(diseaseId, "disease_id");
  const disease = await Disease.findOne({ _id: diseaseId, status: "active" })
    .select("_id disease_name")
    .lean();
  if (!disease)
    throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy bệnh cây đang hoạt động.");
  const protocols = await TreatmentProtocol.find({
    disease_id: diseaseId,
    status: "approved",
  })
    .sort({ version: -1, updated_at: -1 })
    .lean();
  return { disease, protocols };
};

const assertDiagnosis = async (diagnosisId, userId, diseaseId, session) => {
  if (!diagnosisId) return;
  const Diagnosis = mongoose.models.DiseaseDiagnosis;
  if (!Diagnosis)
    throw new AppError(
      "DIAGNOSIS_NOT_AVAILABLE",
      409,
      "Chức năng lưu chẩn đoán chưa khả dụng.",
    );
  const diagnosis = await Diagnosis.findOne({
    _id: diagnosisId,
    user_id: userId,
  }).session(session || null);
  if (!diagnosis)
    throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy kết quả chẩn đoán.");
  if (
    diagnosis.disease_id &&
    String(diagnosis.disease_id) !== String(diseaseId)
  )
    throw new AppError(
      "DIAGNOSIS_DISEASE_MISMATCH",
      400,
      "Bệnh được chọn không khớp kết quả chẩn đoán.",
    );
};

const generateSchedule = async (userId, input) => {
  v.id(userId, "user_id");
  const data = validate.generate(input);
  return mongoose.connection.transaction(async (session) => {
    await getOwnedPlant(userId, data.user_plant_id, session);
    const protocol = await TreatmentProtocol.findOne({
      _id: data.treatment_protocol_id,
      disease_id: data.disease_id,
      status: "approved",
    }).session(session);
    if (!protocol)
      throw new AppError(
        "APPROVED_PROTOCOL_NOT_FOUND",
        404,
        "Không tìm thấy phác đồ đã được phê duyệt cho bệnh này.",
      );
    await assertDiagnosis(data.diagnosis_id, userId, data.disease_id, session);
    const active = await TreatmentSchedule.exists({
      user_plant_id: data.user_plant_id,
      status: "in_progress",
    }).session(session);
    if (active)
      throw new AppError(
        "ACTIVE_TREATMENT_EXISTS",
        409,
        "Cây đang có một đợt điều trị hoạt động.",
      );
    const startDate = data.start_date || utcToday();
    const endDate = addDays(startDate, protocol.duration_days - 1);
    const [schedule] = await TreatmentSchedule.create(
      [
        {
          user_id: userId,
          user_plant_id: data.user_plant_id,
          disease_id: data.disease_id,
          treatment_protocol_id: protocol._id,
          diagnosis_id: data.diagnosis_id || null,
          protocol_snapshot: createProtocolSnapshot(protocol),
          start_date: startDate,
          end_date: endDate,
          status: "generated",
          current_stage: 0,
          tasks: createTasks(protocol, startDate),
        },
      ],
      { session },
    );
    return presentSchedule(schedule, session);
  });
};

const getSchedule = async (userId, scheduleId) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  const schedule = await TreatmentSchedule.findOne({
    _id: scheduleId,
    user_id: userId,
  }).lean();
  if (!schedule)
    throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy lịch điều trị.");
  return presentSchedule(schedule);
};

const activateSchedule = async (userId, scheduleId) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  try {
    return await mongoose.connection.transaction(async (session) => {
      const schedule = await TreatmentSchedule.findOne({
        _id: scheduleId,
        user_id: userId,
      }).session(session);
      if (!schedule)
        throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy lịch điều trị.");
      if (schedule.status !== "generated")
        throw new AppError(
          "INVALID_TREATMENT_TRANSITION",
          409,
          "Chỉ lịch ở trạng thái chờ áp dụng mới có thể bắt đầu.",
        );
      assertTransition(schedule.status, "in_progress");
      const plant = await getOwnedPlant(userId, schedule.user_plant_id, session);
      const otherActive = await TreatmentSchedule.exists({
        _id: { $ne: schedule._id },
        user_plant_id: schedule.user_plant_id,
        status: "in_progress",
      }).session(session);
      if (otherActive)
        throw new AppError(
          "ACTIVE_TREATMENT_EXISTS",
          409,
          "Cây đang có một đợt điều trị hoạt động.",
        );

      const careSchedules = await CareSchedule.find({
        user_id: userId,
        user_plant_id: schedule.user_plant_id,
        is_active: true,
      })
        .session(session)
        .lean();
      schedule.care_schedule_pause_snapshot = createCarePauseSnapshot(careSchedules);
      schedule.plant_health_status_before_treatment = plant.health_status;
      schedule.status = "in_progress";
      schedule.current_stage = 1;
      schedule.history.push({ event: "activated", occurred_at: new Date() });
      await schedule.save({ session });

      await CareSchedule.updateMany(
        {
          _id: { $in: careScheduleIdsToPause(careSchedules) },
          is_paused: false,
        },
        {
          $set: {
            is_paused: true,
            pause_reason: "treatment",
            paused_by_treatment_schedule_id: schedule._id,
          },
        },
        { session },
      );
      await UserPlant.updateOne(
        { _id: plant._id, user_id: userId, archived_at: null },
        { $set: { health_status: "treatment", is_under_treatment: true } },
        { session, runValidators: true },
      );
      const user = await User.findById(userId)
        .select("notification_preferences.treatment_reminders")
        .session(session)
        .lean();
      if (user?.notification_preferences?.treatment_reminders !== false) {
        const operations = createReminderOperations(schedule);
        if (operations.length)
          await Notification.bulkWrite(operations, { session, ordered: false });
      }
      return presentSchedule(schedule, session);
    });
  } catch (error) {
    if (error?.code === 11000)
      throw new AppError(
        "ACTIVE_TREATMENT_EXISTS",
        409,
        "Cây đang có một đợt điều trị hoạt động.",
      );
    throw error;
  }
};

const completeTask = async (userId, scheduleId, taskId) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  v.id(taskId, "task_id");
  return mongoose.connection.transaction(async (session) => {
    const now = new Date();
    const schedule = await TreatmentSchedule.findOneAndUpdate(
      {
        _id: scheduleId,
        user_id: userId,
        status: "in_progress",
        tasks: {
          $elemMatch: {
            _id: taskId,
            status: "pending",
            scheduled_date: { $lte: now },
          },
        },
      },
      {
        $set: {
          "tasks.$.status": "completed",
          "tasks.$.completed_at": now,
        },
        $push: {
          history: {
            event: "task_completed",
            task_id: taskId,
            occurred_at: now,
          },
        },
      },
      { new: true, runValidators: true, session },
    ).lean();
    if (schedule) {
      const pendingStages = schedule.tasks
        .filter((task) => task.status === "pending")
        .map((task) => task.stage_order);
      const nextStage = pendingStages.length
        ? Math.min(...pendingStages)
        : Math.max(...schedule.tasks.map((task) => task.stage_order));
      if (nextStage > schedule.current_stage) {
        await TreatmentSchedule.updateOne(
          { _id: schedule._id, current_stage: schedule.current_stage },
          { $set: { current_stage: nextStage } },
          { session },
        );
        schedule.current_stage = nextStage;
      }
      await Notification.updateMany(
        {
          treatment_schedule_id: schedule._id,
          treatment_task_id: taskId,
          status: "scheduled",
        },
        { $set: { status: "cancelled", cancelled_at: now } },
        { session },
      );
      return presentSchedule(schedule, session);
    }

    const current = await TreatmentSchedule.findOne({
      _id: scheduleId,
      user_id: userId,
    })
      .select("status tasks._id tasks.status")
      .session(session)
      .lean();
    if (!current)
      throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy lịch điều trị.");
    if (current.status !== "in_progress")
      throw new AppError(
        "INVALID_TREATMENT_TRANSITION",
        409,
        "Đợt điều trị không còn hoạt động.",
      );
    const task = current.tasks.find((item) => String(item._id) === taskId);
    if (!task)
      throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy công việc điều trị.");
    if (task.status === "completed")
      throw new AppError("TASK_ALREADY_COMPLETED", 409, "Công việc đã được hoàn thành.");
    throw new AppError("TASK_NOT_AVAILABLE", 409, "Công việc chưa thể hoàn thành.");
  });
};

const rescheduleTask = async (userId, scheduleId, taskId, input) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  v.id(taskId, "task_id");
  const result = validate.rescheduleTask(input);
  return mongoose.connection.transaction(async (session) => {
    const schedule = await TreatmentSchedule.findOne({
      _id: scheduleId,
      user_id: userId,
    }).session(session);
    if (!schedule)
      throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy lịch điều trị.");
    if (schedule.status !== "in_progress")
      throw new AppError(
        "INVALID_TREATMENT_TRANSITION",
        409,
        "Chỉ có thể đổi lịch khi đợt điều trị đang hoạt động.",
      );
    const task = schedule.tasks.id(taskId);
    if (!task)
      throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy công việc điều trị.");
    if (task.status !== "pending")
      throw new AppError(
        "TASK_ALREADY_COMPLETED",
        409,
        "Không thể đổi lịch công việc đã hoàn thành.",
      );
    if (
      result.scheduled_date < schedule.start_date ||
      result.scheduled_date > schedule.end_date
    )
      throw new AppError(
        "TASK_DATE_OUT_OF_RANGE",
        400,
        "Ngày thực hiện phải nằm trong thời gian điều trị.",
      );

    task.scheduled_date = result.scheduled_date;
    schedule.history.push({
      event: "task_rescheduled",
      task_id: task._id,
      occurred_at: new Date(),
      note: result.scheduled_date.toISOString().slice(0, 10),
    });
    await schedule.save({ session });
    // Sent/cancelled reminders remain historical and are never resurrected.
    await Notification.updateOne(
      {
        treatment_schedule_id: schedule._id,
        treatment_task_id: task._id,
        status: "scheduled",
      },
      { $set: { scheduled_for: result.scheduled_date } },
      { session },
    );
    return presentSchedule(schedule, session);
  });
};

const finishSchedule = async (userId, scheduleId, input) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  const result = validate.finish(input);
  return mongoose.connection.transaction(async (session) => {
    const schedule = await TreatmentSchedule.findOne({
      _id: scheduleId,
      user_id: userId,
    }).session(session);
    if (!schedule)
      throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy lịch điều trị.");
    if (schedule.status !== "in_progress")
      throw new AppError(
        "INVALID_TREATMENT_TRANSITION",
        409,
        "Chỉ đợt điều trị đang hoạt động mới có thể kết thúc.",
      );
    assertTransition(schedule.status, result.status);
    assertOutcomeRequirements(schedule, result.status);
    await getOwnedPlant(userId, schedule.user_plant_id, session);
    const resumeIds = careScheduleIdsToResume(
      schedule.care_schedule_pause_snapshot,
    );
    await CareSchedule.updateMany(
      {
        _id: { $in: resumeIds },
        paused_by_treatment_schedule_id: schedule._id,
        pause_reason: "treatment",
      },
      {
        $set: {
          is_paused: false,
          pause_reason: null,
          paused_by_treatment_schedule_id: null,
        },
      },
      { session },
    );
    const restoredHealth =
      result.status === "recovered"
        ? "healthy"
        : schedule.plant_health_status_before_treatment || "healthy";
    await UserPlant.updateOne(
      { _id: schedule.user_plant_id, user_id: userId },
      {
        $set: {
          health_status: restoredHealth,
          is_under_treatment: false,
        },
      },
      { session, runValidators: true },
    );
    await Notification.updateMany(
      {
        treatment_schedule_id: schedule._id,
        status: "scheduled",
      },
      { $set: { status: "cancelled", cancelled_at: new Date() } },
      { session },
    );
    schedule.status = result.status;
    schedule.completed_at = new Date();
    schedule.follow_up_note = result.note;
    schedule.history.push({
      event: result.status,
      occurred_at: schedule.completed_at,
      note: result.note,
    });
    await schedule.save({ session });
    return presentSchedule(schedule, session);
  });
};

module.exports = {
  getApprovedProtocols,
  generateSchedule,
  getSchedule,
  activateSchedule,
  completeTask,
  rescheduleTask,
  finishSchedule,
  _private: {
    addDays,
    createProtocolSnapshot,
    createTasks,
    progress,
    presentSchedule,
    terminalStatuses,
    assertTransition,
    assertOutcomeRequirements,
    createCarePauseSnapshot,
    careScheduleIdsToPause,
    careScheduleIdsToResume,
    createReminderOperations,
  },
};
