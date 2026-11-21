const mongoose = require("mongoose");

const PROTOCOL_STATUSES = ["draft", "approved", "deprecated"];
const INSTRUCTION_SOURCES = ["manager_verified", "imported", "ai_unverified"];

const treatmentStageSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    time: {
      type: String,
      required: true,
      default: "08:00",
      match: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    },
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
    plant_ids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plant" }],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0 &&
          new Set(items.map(String)).size === items.length,
        message: "Phác đồ cần ít nhất một cây áp dụng và không được trùng cây.",
      },
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
    source_document: {
      name: { type: String, trim: true, maxlength: 255, default: "" },
      extracted_characters: { type: Number, min: 0, default: 0 },
      sha256: { type: String, trim: true, maxlength: 64, default: "" },
    },
    reference_status: {
      type: String,
      enum: ["document_assisted", "ai_unverified"],
      default: "ai_unverified",
    },
    reference_notice: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    ai_generation: {
      model: { type: String, trim: true, maxlength: 200, default: "" },
      generated_at: { type: Date, default: null },
    },
    generation_source: {
      type: String,
      enum: ["manual", "manager_document", "bundled_document", "ai_only"],
      default: "manual",
      index: true,
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
      required() {
        return !(this.generation_source === "bundled_document" ||
          (this.generation_source === "ai_only" && !this.created_by));
      },
      default: null,
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
    if (
      stages.some((stage, index) => stage.order !== index + 1) ||
      stages.some(
        (stage, index) =>
          stage.start_day !== (index === 0 ? 1 : stages[index - 1].end_day + 1),
      ) ||
      occupiedDays.size !== this.duration_days ||
      Array.from(
        { length: this.duration_days },
        (_, index) => index + 1,
      ).some((day) => !occupiedDays.has(day))
    )
      this.invalidate(
        "stages",
        "Phác đồ được phê duyệt phải có giai đoạn liên tục và bao phủ đủ toàn bộ thời lượng.",
      );
    const systemGenerated = this.generation_source === "bundled_document" ||
      (this.generation_source === "ai_only" && !this.created_by);
    if (!this.approved_by && !systemGenerated)
      this.invalidate("approved_by", "Phác đồ được phê duyệt cần người phê duyệt.");
    if (!this.approved_at)
      this.invalidate("approved_at", "Phác đồ được phê duyệt cần thời điểm phê duyệt.");
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
treatmentProtocolSchema.index({ disease_id: 1, plant_ids: 1, status: 1 });

module.exports = mongoose.model(
  "TreatmentProtocol",
  treatmentProtocolSchema,
  "treatment_protocols",
);
module.exports.PROTOCOL_STATUSES = PROTOCOL_STATUSES;
module.exports.INSTRUCTION_SOURCES = INSTRUCTION_SOURCES;
