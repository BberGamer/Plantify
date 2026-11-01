const mongoose = require("mongoose");

const PROTOCOL_STATUSES = ["draft", "approved", "deprecated"];
const INSTRUCTION_SOURCES = ["manager_verified", "imported", "ai_unverified"];

const treatmentStageSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    start_day: { type: Number, required: true, min: 1 },
    end_day: { type: Number, required: true, min: 1 },
    instructions: {
      type: [{ type: String, trim: true, maxlength: 2000 }],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0 && items.every(Boolean),
        message: "Mỗi giai đoạn cần ít nhất một hướng dẫn.",
      },
    },
    dosage_note: { type: String, trim: true, maxlength: 2000, default: "" },
    important_note: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { _id: true, id: false },
);

const treatmentProtocolSchema = new mongoose.Schema(
  {
    disease_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      required: true,
      immutable: true,
    },
    protocol_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    duration_days: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    stages: {
      type: [treatmentStageSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Phác đồ cần ít nhất một giai đoạn.",
      },
    },
    approved_instructions: {
      type: [{ type: String, trim: true, maxlength: 2000 }],
      default: () => [],
    },
    safety_guidelines: {
      type: [{ type: String, trim: true, maxlength: 2000 }],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0 && items.every(Boolean),
        message: "Phác đồ cần ít nhất một hướng dẫn an toàn.",
      },
    },
    instruction_source: {
      type: String,
      enum: INSTRUCTION_SOURCES,
      default: "ai_unverified",
    },
    status: {
      type: String,
      enum: PROTOCOL_STATUSES,
      default: "draft",
      index: true,
    },
    version: { type: Number, required: true, min: 1, default: 1 },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approved_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    optimisticConcurrency: true,
  },
);

treatmentProtocolSchema.pre("validate", function validateProtocol(next) {
  const stages = this.stages || [];
  const orders = new Set();
  const occupiedDays = new Set();
  for (const stage of stages) {
    if (stage.end_day < stage.start_day) {
      this.invalidate("stages", "Ngày kết thúc giai đoạn không được trước ngày bắt đầu.");
      break;
    }
    if (stage.end_day > this.duration_days) {
      this.invalidate("stages", "Giai đoạn phải nằm trong thời lượng phác đồ.");
      break;
    }
    if (orders.has(stage.order)) {
      this.invalidate("stages", "Thứ tự giai đoạn không được trùng nhau.");
      break;
    }
    orders.add(stage.order);
    for (let day = stage.start_day; day <= stage.end_day; day += 1) {
      if (occupiedDays.has(day)) {
        this.invalidate("stages", "Các giai đoạn không được chồng lấn ngày.");
        break;
      }
      occupiedDays.add(day);
    }
  }

  if (this.status === "approved") {
    if (this.instruction_source === "ai_unverified")
      this.invalidate(
        "instruction_source",
        "Hướng dẫn do AI tạo phải được Manager xác minh trước khi phê duyệt.",
      );
    if (!this.approved_by)
      this.invalidate("approved_by", "Phác đồ được phê duyệt cần người phê duyệt.");
    if (!this.approved_at)
      this.invalidate("approved_at", "Phác đồ được phê duyệt cần thời điểm phê duyệt.");
    if (!this.approved_instructions?.length)
      this.invalidate(
        "approved_instructions",
        "Phác đồ được phê duyệt cần hướng dẫn đã xác minh.",
      );
  }
  next();
});

treatmentProtocolSchema.index(
  { disease_id: 1, protocol_name: 1, version: 1 },
  {
    unique: true,
    collation: { locale: "vi", strength: 2 },
    name: "unique_protocol_version_per_disease",
  },
);
treatmentProtocolSchema.index({ disease_id: 1, status: 1, updated_at: -1 });

module.exports = mongoose.model(
  "TreatmentProtocol",
  treatmentProtocolSchema,
  "treatment_protocols",
);
module.exports.PROTOCOL_STATUSES = PROTOCOL_STATUSES;
module.exports.INSTRUCTION_SOURCES = INSTRUCTION_SOURCES;
