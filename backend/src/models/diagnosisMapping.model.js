const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    model_run_id: { type: String, required: true },
    checkpoint_sha256: { type: String, required: true },
    class_id: { type: Number, required: true, min: 0 },
    class_name: { type: String, required: true },
    is_healthy: { type: Boolean, required: true },
    plant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      default: null,
    },
    disease_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      default: null,
    },
    status: { type: String, enum: ["ready", "pending"], required: true },
    reason: { type: String, default: "" },
    import_source: String,
  },
  { timestamps: true },
);
schema.index(
  { model_run_id: 1, checkpoint_sha256: 1, class_id: 1 },
  { unique: true },
);
schema.pre("validate", function (next) {
  if (this.is_healthy && this.disease_id)
    this.invalidate("disease_id", "Nhãn khỏe không có bệnh.");
  if (
    this.status === "ready" &&
    (!this.plant_id || (!this.is_healthy && !this.disease_id))
  )
    this.invalidate("status", "Mapping sẵn sàng cần đủ tham chiếu.");
  next();
});
module.exports = mongoose.model(
  "DiagnosisMapping",
  schema,
  "diagnosis_mappings",
);
