const { Schema, model } = require("mongoose");

const types = ["diagnosis_feedback", "proactive_feedback"];
const decisions = ["accepted", "rejected"];

const imageSchema = new Schema({
  storage: { type: String, enum: ["local", "cloudinary"], required: true },
  filename: String,
  public_id: String,
  asset_id: String,
}, { _id: false });

const reviewSchema = new Schema({
  status: { type: String, enum: decisions, required: true },
  response: { type: String, required: true, maxlength: 1000 },
  manager_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviewed_at: { type: Date, required: true },
}, { _id: false });

const feedbackSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  request_key: { type: String, required: true, select: false },
  diagnosis_id: { type: Schema.Types.ObjectId, ref: "DiseaseDiagnosis", default: null },
  type: { type: String, enum: types, required: true },
  description: { type: String, required: true, maxlength: 250 },
  images: {
    type: [imageSchema],
    validate: (images) => images.length >= 1 && images.length <= 5,
  },
  status: { type: String, enum: ["pending", ...decisions], default: "pending" },
  review: { type: reviewSchema, default: null },
  review_count: { type: Number, default: 0, min: 0 },
  review_history: { type: [reviewSchema], select: false },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

feedbackSchema.index({ user_id: 1, request_key: 1 }, { unique: true });
feedbackSchema.index({ user_id: 1, created_at: -1, _id: -1 });
feedbackSchema.index({ created_at: -1, _id: -1 });

module.exports = { Feedback: model("Feedback", feedbackSchema), types, decisions };
