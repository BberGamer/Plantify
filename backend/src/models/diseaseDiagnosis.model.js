const mongoose = require("mongoose");
const { Schema } = mongoose;

const predictionSnapshot = new Schema({
  title: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  plant_id: { type: Schema.Types.ObjectId, default: null },
  disease_id: { type: Schema.Types.ObjectId, default: null },
}, { _id: false });

const planSelection = new Schema({
  rank: { type: Number, required: true, min: 1, max: 3 },
  user_plant_id: { type: Schema.Types.ObjectId, ref: "UserPlant", required: true },
  saved_at: { type: Date, required: true },
}, { _id: false });

const diagnosisSchema = new mongoose.Schema(
  {
    result_kind: { type: String, enum: ["plant", "disease"], default: "disease", immutable: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    user_plant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlant",
      default: null,
    },
    plant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
      immutable: true,
    },
    disease_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      required: function () { return this.result_kind === "disease" && !this.is_healthy; },
      immutable: true,
    },
    is_healthy: { type: Boolean, default: false, immutable: true },
    predictions: { type: [predictionSnapshot], default: undefined, immutable: true },
    plan_selections: { care: planSelection, treatment: planSelection },
    treatment_candidates: {
      type: [new mongoose.Schema({
        plant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plant", required: true },
        disease_id: { type: mongoose.Schema.Types.ObjectId, ref: "Disease", required: true },
      }, { _id: false })],
      default: undefined,
      immutable: true,
    },
    class_id: { type: Number, required: function () { return this.result_kind !== "plant"; }, min: 0, immutable: true },
    class_name: { type: String, required: function () { return this.result_kind !== "plant"; }, trim: true, immutable: true },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      immutable: true,
    },
    status: {
      type: String,
      enum: ["identified"],
      required: true,
      immutable: true,
    },
    model: {
      sha256: String,
      name: { type: String, required: true },
      run_id: { type: String, required: true },
      checkpoint: { type: String, required: true },
      checkpoint_epoch: { type: Number, required: true },
    },
    image: {
      storage: { type: String, enum: ["local", "cloudinary"], immutable: true },
      public_id: { type: String, immutable: true },
      asset_id: { type: String, immutable: true },
      filename: { type: String, immutable: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    processing_ms: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

diagnosisSchema.pre("validate", function (next) {
  if ((this.result_kind === "plant" || this.is_healthy) && this.disease_id)
    this.invalidate("disease_id", "Kết quả này không có bệnh ở dự đoán đầu tiên.");
  next();
});

diagnosisSchema.index({ user_id: 1, created_at: -1 });
diagnosisSchema.index({ plant_id: 1, disease_id: 1, created_at: -1 });

module.exports = mongoose.model(
  "DiseaseDiagnosis",
  diagnosisSchema,
  "disease_diagnoses",
);
