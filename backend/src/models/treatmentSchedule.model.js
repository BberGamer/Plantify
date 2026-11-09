const mongoose = require("mongoose");

const TREATMENT_STATUSES = [
  "generated",
  "in_progress",
  "recovered",
  "failed",
  "cancelled",
];
const TASK_STATUSES = ["pending", "completed", "skipped"];

const snapshotStageSchema = new mongoose.Schema(
  {
    source_stage_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    start_day: { type: Number, required: true, min: 1 },
    end_day: { type: Number, required: true, min: 1 },
    instructions: {
      type: [{ type: String, required: true, trim: true, maxlength: 2000 }],
      required: true,
    },
    dosage_note: { type: String, trim: true, maxlength: 2000, default: "" },
    important_note: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { _id: false, id: false },
);

const protocolSnapshotSchema = new mongoose.Schema(
  {
    protocol_name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    duration_days: { type: Number, required: true, min: 1, max: 365 },
    version: { type: Number, required: true, min: 1 },
    approved_instructions: {
      type: [{ type: String, required: true, trim: true, maxlength: 2000 }],
      required: true,
    },
    safety_guidelines: {
      type: [{ type: String, required: true, trim: true, maxlength: 2000 }],
      required: true,
    },
    stages: { type: [snapshotStageSchema], required: true },
  },
  { _id: false, id: false },
);

const treatmentTaskSchema = new mongoose.Schema(
  {
    stage_order: { type: Number, required: true, min: 1, immutable: true },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      immutable: true,
    },
    scheduled_date: { type: Date, required: true },
    instructions: {
      type: [{ type: String, required: true, trim: true, maxlength: 2000 }],
      required: true,
      immutable: true,
    },
    important_note: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
      immutable: true,
    },
    status: { type: String, enum: TASK_STATUSES, default: "pending" },
    completed_at: { type: Date, default: null },
  },
  { _id: true, id: false },
);

const carePauseSnapshotSchema = new mongoose.Schema(
  {
    care_schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareSchedule",
      required: true,
    },
    was_paused: { type: Boolean, required: true },
    previous_pause_reason: {
      type: String,
      enum: ["manual", "treatment", null],
      default: null,
    },
  },
  { _id: false, id: false },
);

const treatmentHistorySchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: [
        "generated",
        "activated",
        "task_completed",
        "task_rescheduled",
        "recovered",
        "failed",
        "cancelled",
      ],
      required: true,
    },
    task_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    occurred_at: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { _id: true, id: false },
);

treatmentTaskSchema.pre("validate", function validateCompletion(next) {
  if (this.status === "completed" && !this.completed_at)
    this.invalidate("completed_at", "Công việc hoàn thành cần thời điểm hoàn thành.");
  if (this.status !== "completed" && this.completed_at)
    this.invalidate(
      "completed_at",
      "Chỉ công việc đã hoàn thành mới có thời điểm hoàn thành.",
    );
  next();
});

const treatmentScheduleSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    user_plant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlant",
      required: true,
      immutable: true,
    },
    disease_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      required: true,
      immutable: true,
    },
    treatment_protocol_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreatmentProtocol",
      required: true,
      immutable: true,
    },
    diagnosis_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiseaseDiagnosis",
      default: null,
      immutable: true,
    },
    protocol_snapshot: {
      type: protocolSnapshotSchema,
      required: true,
      immutable: true,
    },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    status: {
      type: String,
      enum: TREATMENT_STATUSES,
      default: "generated",
      index: true,
    },
    current_stage: { type: Number, min: 0, default: 0 },
    tasks: {
      type: [treatmentTaskSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Lịch điều trị cần ít nhất một công việc.",
      },
    },
    care_schedule_pause_snapshot: {
      type: [carePauseSnapshotSchema],
      default: () => [],
    },
    plant_health_status_before_treatment: {
      type: String,
      enum: ["healthy", "treatment", null],
      default: null,
    },
    history: {
      type: [treatmentHistorySchema],
      default: () => [{ event: "generated", occurred_at: new Date() }],
    },
    completed_at: { type: Date, default: null },
    follow_up_note: { type: String, trim: true, maxlength: 5000, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    optimisticConcurrency: true,
  },
);

treatmentScheduleSchema.pre("validate", function validateSchedule(next) {
  if (this.status !== "generated") {
    if (!this.start_date)
      this.invalidate("start_date", "Lịch đang áp dụng cần ngày bắt đầu.");
    if (!this.end_date)
      this.invalidate("end_date", "Lịch đang áp dụng cần ngày kết thúc dự kiến.");
  }
  if (this.start_date && this.end_date && this.end_date < this.start_date)
    this.invalidate("end_date", "Ngày kết thúc không được trước ngày bắt đầu.");
  if (["recovered", "failed", "cancelled"].includes(this.status) && !this.completed_at)
    this.invalidate("completed_at", "Lịch đã kết thúc cần thời điểm kết thúc.");
  if (!["recovered", "failed", "cancelled"].includes(this.status) && this.completed_at)
    this.invalidate("completed_at", "Lịch chưa kết thúc không được có thời điểm kết thúc.");
  if (
    this.protocol_snapshot?.stages?.length &&
    this.current_stage > this.protocol_snapshot.stages.length
  )
    this.invalidate("current_stage", "Giai đoạn hiện tại vượt quá phác đồ.");
  next();
});

// MongoDB là lớp bảo vệ cuối cùng chống hai request đồng thời cùng kích hoạt một cây.
treatmentScheduleSchema.index(
  { user_plant_id: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "in_progress" },
    name: "one_active_treatment_per_user_plant",
  },
);
treatmentScheduleSchema.index({ user_id: 1, status: 1, created_at: -1 });
treatmentScheduleSchema.index({ user_plant_id: 1, created_at: -1 });
treatmentScheduleSchema.index({ treatment_protocol_id: 1, created_at: -1 });
treatmentScheduleSchema.index({ diagnosis_id: 1 }, { sparse: true });

module.exports = mongoose.model(
  "TreatmentSchedule",
  treatmentScheduleSchema,
  "treatment_schedules",
);
module.exports.TREATMENT_STATUSES = TREATMENT_STATUSES;
module.exports.TASK_STATUSES = TASK_STATUSES;
