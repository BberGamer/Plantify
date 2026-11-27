const {
  getManagerProtocols,
  getManagerProtocol,
  createProtocol,
  updateProtocol,
  deprecateProtocol,
} = require("./treatment-protocol.service");
const mongoose = require("mongoose");
const AppError = require("../utils/app-error");
const TreatmentProtocol = require("../models/treatmentProtocol.model");
const TreatmentSchedule = require("../models/treatmentSchedule.model");
const UserPlant = require("../models/userPlant.model");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const { assertTreatmentCandidate, savePlanSelection } = require("./diagnosis.service");
const CareSchedule = require("../models/careSchedule.model");
const Notification = require("../models/notification.model");
const validate = require("../validators/treatment.validator");
const v = require("../validators/common");
const treatmentAI = require("./treatment-ai.service");

const DAY_MS = 24 * 60 * 60 * 1000;
const terminalStatuses = ["recovered", "failed", "cancelled"];

const withTransactionResult = require("../utils/transaction-result");

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
  snapshot
    .filter((item) => !item.was_paused)
    .map((item) => item.care_schedule_id);

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
          dispatch_managed: true,
          dedupe_key: `treatment:${schedule._id}:task:${task._id}`,
        },
      },
      upsert: true,
    },
  }));

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);
const withVietnamTime = (date, time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(
    date.getTime() + (hours - 7) * 60 * 60 * 1000 + minutes * 60 * 1000,
  );
};
const utcToday = () => {
  const now = new Date();
  const vietnam = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(
      vietnam.getUTCFullYear(),
      vietnam.getUTCMonth(),
      vietnam.getUTCDate(),
    ),
  );
};
const vietnamDateKey = (date) =>
  new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

const createProtocolSnapshot = (protocol) => ({
  protocol_name: protocol.protocol_name,
  description: protocol.description,
  duration_days: protocol.duration_days,
  version: protocol.version,
  approved_instructions: [...protocol.approved_instructions],
  safety_guidelines: [...protocol.safety_guidelines],
  reference_status:
    protocol.reference_status ||
    (protocol.instruction_source === "ai_unverified"
      ? "ai_unverified"
      : "document_assisted"),
  reference_notice: protocol.reference_notice || "",
  stages: protocol.stages.map((stage) => ({
    source_stage_id: stage._id,
    order: stage.order,
    title: stage.title,
    time: stage.time || "08:00",
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
          scheduled_date: withVietnamTime(
            addDays(startDate, day - 1),
            stage.time || "08:00",
          ),
          time: stage.time || "08:00",
          instructions: [...stage.instructions],
          dosage_note: stage.dosage_note || "",
          important_note: stage.important_note || "",
          status: "pending",
        });
      }
      return tasks;
    })
    .sort((left, right) => left.scheduled_date - right.scheduled_date);

const progress = (schedule) => {
  const tasks = schedule.tasks || [];
  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  return {
    completed_tasks: completedTasks,
    total_tasks: tasks.length,
    percent: tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0,
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
    task_edited: "Đã chỉnh sửa công việc điều trị",
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
      value.status === "generated"
        ? 0
        : Math.max(1, Math.min(duration, elapsed)),
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
      reference_status: value.protocol_snapshot.reference_status,
      reference_notice: value.protocol_snapshot.reference_notice,
    },
    stages: value.protocol_snapshot.stages.map((stage) => ({
      ...stage,
      _id: String(stage.source_stage_id || `stage-${stage.order}`),
    })),
    task_progress: value.tasks.map((task) => ({
      ...task,
      status:
        task.status === "pending" && new Date(task.scheduled_date) > utcToday()
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

// Xác minh cả trạng thái và nội dung thật, kể cả bản ghi được nhập trực tiếp vào DB.
const isUsableProtocol = async (protocol) => {
  if (!protocol || protocol.status !== "approved") return false;
  try {
    const doc =
      protocol instanceof mongoose.Document
        ? protocol
        : new TreatmentProtocol(protocol);
    await doc.validate();
    return true;
  } catch {
    return false;
  }
};

const findApprovedProtocols = (diseaseId, plantId) =>
  TreatmentProtocol.find({
    disease_id: diseaseId,
    status: "approved",
    ...(plantId ? { plant_ids: plantId } : {}),
  })
    .select("-reference_material -source_document -ai_generation")
    .sort({ version: -1, updated_at: -1 })
    .lean();

// Caller chẩn đoán đã kiểm tra bệnh và quan hệ cây; chỉ truy vấn phác đồ một lần.
const hasApprovedProtocol = async (diseaseId, plantId) => {
  v.id(diseaseId, "disease_id");
  v.id(plantId, "plant_id");
  const protocols = await findApprovedProtocols(diseaseId, plantId);
  for (const protocol of protocols)
    if (await isUsableProtocol(protocol)) return true;
  return false;
};

const getApprovedProtocols = async (diseaseId, plantId) => {
  v.id(diseaseId, "disease_id");
  if (plantId) v.id(plantId, "plant_id");
  const disease = await Disease.findOne({ _id: diseaseId, status: "active" })
    .select("_id disease_name")
    .lean();
  if (!disease)
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      404,
      "Không tìm thấy bệnh cây đang hoạt động.",
    );
  const protocols = await findApprovedProtocols(diseaseId, plantId);
  const usable = await Promise.all(protocols.map(isUsableProtocol));
  return { disease, protocols: protocols.filter((_, index) => usable[index]) };
};

const generateSchedule = async (userId, input) => {
  v.id(userId, "user_id");
  const data = validate.generate(input);
  const preview = treatmentAI.verifyCustomerPreview(data.preview_token, userId);
  if (
    String(preview.disease_id) !== String(data.disease_id) ||
    String(preview.diagnosis_id || "") !== String(data.diagnosis_id || "")
  )
    throw new AppError(
      "TREATMENT_PREVIEW_MISMATCH",
      400,
      "Bản xem trước không khớp kết quả chẩn đoán đã chọn.",
    );
  try {
    return await withTransactionResult(async (session) => {
      const plant = await getOwnedPlant(userId, data.user_plant_id, session);
      if (String(preview.plant_id) !== String(plant.plant_id))
        throw new AppError(
          "TREATMENT_PREVIEW_MISMATCH",
          400,
          "Cây trong vườn không khớp bản xem trước phác đồ.",
        );
      const diagnosis = await assertTreatmentCandidate(
        data.diagnosis_id,
        userId,
        plant.plant_id,
        data.disease_id,
        session,
        preview.candidate_rank,
      );
      if (
        diagnosis?.user_plant_id &&
        String(diagnosis.user_plant_id) !== String(plant._id)
      )
        throw new AppError(
          "DIAGNOSIS_ALREADY_USED",
          409,
          "Kết quả chẩn đoán đã được dùng cho cây khác.",
        );
      if (diagnosis) {
        const previous = await TreatmentSchedule.findOne({
          diagnosis_id: diagnosis._id,
          user_id: userId,
        }).session(session);
        if (previous) {
          if (
            ["generated", "in_progress"].includes(previous.status) &&
            String(previous.disease_id) === String(data.disease_id)
          )
            return presentSchedule(previous, session);
          throw new AppError(
            "DIAGNOSIS_ALREADY_USED",
            409,
            "Kết quả chẩn đoán đã được dùng cho một đợt điều trị.",
          );
        }
        diagnosis.user_plant_id = plant._id;
        await diagnosis.save({ session });
      }
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
      const latest = await TreatmentProtocol.findOne({
        disease_id: data.disease_id,
        protocol_name: preview.protocol.protocol_name,
      })
        .sort({ version: -1 })
        .select("version")
        .session(session)
        .lean();
      const [protocol] = await TreatmentProtocol.create(
        [
          {
            ...preview.protocol,
            disease_id: data.disease_id,
            plant_ids: [plant.plant_id],
            version: (latest?.version || 0) + 1,
            status: "approved",
            created_by: null,
            approved_by: null,
            approved_at: new Date(),
          },
        ],
        { session },
      );
      const startDate = data.start_date || utcToday();
      const endDate = addDays(startDate, protocol.duration_days - 1);
      const [schedule] = await TreatmentSchedule.create(
        [
          {
            ...(data.schedule_id ? { _id: data.schedule_id } : {}),
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
      await savePlanSelection(diagnosis, "treatment", plant, data.disease_id, preview.candidate_rank, session);
      return presentSchedule(schedule, session);
    });
  } catch (error) {
    if (error?.code === 11000 && data.diagnosis_id) {
      const previous = await TreatmentSchedule.findOne({
        diagnosis_id: data.diagnosis_id,
        user_id: userId,
      }).lean();
      if (
        previous &&
        ["generated", "in_progress"].includes(previous.status) &&
        String(previous.disease_id) === String(data.disease_id) &&
        String(previous.user_plant_id) === String(data.user_plant_id)
      )
        return presentSchedule(previous);
      throw new AppError(
        "DIAGNOSIS_ALREADY_USED",
        409,
        "Kết quả chẩn đoán đã được dùng để tạo lịch điều trị.",
      );
    }
    throw error;
  }
};

const getSchedule = async (userId, scheduleId) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  const schedule = await TreatmentSchedule.findOne({
    _id: scheduleId,
    user_id: userId,
  }).lean();
  if (!schedule)
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      404,
      "Không tìm thấy lịch điều trị.",
    );
  return presentSchedule(schedule);
};

const activateSchedule = async (userId, scheduleId) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  try {
    return await withTransactionResult(async (session) => {
      const schedule = await TreatmentSchedule.findOne({
        _id: scheduleId,
        user_id: userId,
      }).session(session);
      if (!schedule)
        throw new AppError(
          "RESOURCE_NOT_FOUND",
          404,
          "Không tìm thấy lịch điều trị.",
        );
      if (schedule.status !== "generated")
        throw new AppError(
          "INVALID_TREATMENT_TRANSITION",
          409,
          "Chỉ lịch ở trạng thái chờ áp dụng mới có thể bắt đầu.",
        );
      assertTransition(schedule.status, "in_progress");
      const plant = await getOwnedPlant(
        userId,
        schedule.user_plant_id,
        session,
      );
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
      schedule.care_schedule_pause_snapshot =
        createCarePauseSnapshot(careSchedules);
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
      const operations = createReminderOperations(schedule);
      if (operations.length)
        await Notification.bulkWrite(operations, { session, ordered: false });
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
  return withTransactionResult(async (session) => {
    const now = new Date();
    const availableThrough = new Date();
    const schedule = await TreatmentSchedule.findOneAndUpdate(
      {
        _id: scheduleId,
        user_id: userId,
        status: "in_progress",
        tasks: {
          $elemMatch: {
            _id: taskId,
            status: "pending",
            scheduled_date: { $lte: availableThrough },
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
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy lịch điều trị.",
      );
    if (current.status !== "in_progress")
      throw new AppError(
        "INVALID_TREATMENT_TRANSITION",
        409,
        "Đợt điều trị không còn hoạt động.",
      );
    const task = current.tasks.find((item) => String(item._id) === taskId);
    if (!task)
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy công việc điều trị.",
      );
    if (task.status === "completed")
      throw new AppError(
        "TASK_ALREADY_COMPLETED",
        409,
        "Công việc đã được hoàn thành.",
      );
    throw new AppError(
      "TASK_NOT_AVAILABLE",
      409,
      "Công việc chưa thể hoàn thành.",
    );
  });
};

const editTask = async (userId, scheduleId, taskId, input) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  v.id(taskId, "task_id");
  const result = validate.editTask(input);
  return withTransactionResult(async (session) => {
    const schedule = await TreatmentSchedule.findOne({
      _id: scheduleId,
      user_id: userId,
    }).session(session);
    if (!schedule)
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy lịch điều trị.",
      );
    if (schedule.status !== "in_progress")
      throw new AppError(
        "INVALID_TREATMENT_TRANSITION",
        409,
        "Chỉ có thể chỉnh sửa phác đồ đang được áp dụng.",
      );

    const task = schedule.tasks.id(taskId);
    if (!task)
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy công việc điều trị.",
      );
    const dateKey = result.scheduled_date
      ? result.scheduled_date.toISOString().slice(0, 10)
      : vietnamDateKey(task.scheduled_date);
    const treatmentDate = new Date(`${dateKey}T00:00:00.000Z`);
    const time = result.time || task.time || "08:00";
    const scheduledDate = withVietnamTime(treatmentDate, time);
    if (
      treatmentDate < schedule.start_date ||
      treatmentDate > schedule.end_date
    )
      throw new AppError(
        "TASK_DATE_OUT_OF_RANGE",
        400,
        "Ngày thực hiện phải nằm trong thời gian điều trị.",
      );

    for (const field of [
      "title",
      "instructions",
      "dosage_note",
      "important_note",
    ]) {
      if (result[field] !== undefined) task[field] = result[field];
    }
    task.time = time;
    task.scheduled_date = scheduledDate;
    schedule.tasks.sort(
      (left, right) => left.scheduled_date - right.scheduled_date,
    );
    schedule.history.push({
      event: "task_edited",
      task_id: task._id,
      occurred_at: new Date(),
      note: `Đã chỉnh sửa “${task.title}” (${dateKey} ${time}).`,
    });
    await schedule.save({ session });

    const reminder = await Notification.updateOne(
      {
        treatment_schedule_id: schedule._id,
        treatment_task_id: task._id,
        status: "scheduled",
      },
      {
        $set: {
          message: task.title,
          scheduled_for: task.scheduled_date,
        },
      },
      { session },
    );
    if (!reminder.matchedCount && task.status === "pending") {
      const operations = createReminderOperations({
        _id: schedule._id,
        user_id: userId,
        tasks: [task],
      });
      await Notification.bulkWrite(operations, { session });
    }
    return presentSchedule(schedule, session);
  });
};

const rescheduleTask = async (userId, scheduleId, taskId, input) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  v.id(taskId, "task_id");
  const result = validate.rescheduleTask(input);
  return withTransactionResult(async (session) => {
    const schedule = await TreatmentSchedule.findOne({
      _id: scheduleId,
      user_id: userId,
    }).session(session);
    if (!schedule)
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy lịch điều trị.",
      );
    if (schedule.status !== "in_progress")
      throw new AppError(
        "INVALID_TREATMENT_TRANSITION",
        409,
        "Chỉ có thể đổi lịch khi đợt điều trị đang hoạt động.",
      );
    const task = schedule.tasks.id(taskId);
    if (!task)
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy công việc điều trị.",
      );
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

    task.scheduled_date = withVietnamTime(
      result.scheduled_date,
      task.time || "08:00",
    );
    schedule.history.push({
      event: "task_rescheduled",
      task_id: task._id,
      occurred_at: new Date(),
      note: `${result.scheduled_date.toISOString().slice(0, 10)} ${task.time || "08:00"}`,
    });
    await schedule.save({ session });
    const updatedReminder = await Notification.updateOne(
      {
        treatment_schedule_id: schedule._id,
        treatment_task_id: task._id,
        status: "scheduled",
      },
      { $set: { scheduled_for: task.scheduled_date } },
      { session },
    );
    if (!updatedReminder.matchedCount) {
      const reminders = createReminderOperations({
        _id: schedule._id,
        user_id: userId,
        tasks: [task],
      });
      await Notification.bulkWrite(reminders, { session });
    }
    return presentSchedule(schedule, session);
  });
};

const finishSchedule = async (userId, scheduleId, input) => {
  v.id(userId, "user_id");
  v.id(scheduleId, "schedule_id");
  const result = validate.finish(input);
  return withTransactionResult(async (session) => {
    const schedule = await TreatmentSchedule.findOne({
      _id: scheduleId,
      user_id: userId,
    }).session(session);
    if (!schedule)
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy lịch điều trị.",
      );
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
  hasApprovedProtocol,
  getApprovedProtocols,
  generateSchedule,
  getSchedule,
  activateSchedule,
  completeTask,
  editTask,
  rescheduleTask,
  finishSchedule,
  getManagerProtocols,
  getManagerProtocol,
  createProtocol,
  updateProtocol,
  deprecateProtocol,
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
