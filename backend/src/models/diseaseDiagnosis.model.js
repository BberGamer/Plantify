const mongoose = require("mongoose");

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
      required: function () { return this.result_kind !== "plant"; },
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
  if (this.result_kind === "plant" && this.disease_id)
    this.invalidate("disease_id", "Nhận diện cây không kết luận bệnh.");
  next();
});

diagnosisSchema.index({ user_id: 1, created_at: -1 });
diagnosisSchema.index({ plant_id: 1, disease_id: 1, created_at: -1 });

module.exports = mongoose.model(
  "DiseaseDiagnosis",
  diagnosisSchema,
  "disease_diagnoses",
);
