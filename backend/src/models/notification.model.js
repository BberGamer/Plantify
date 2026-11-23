const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    treatment_schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreatmentSchedule",
      required() { return this.type === "treatment"; },
    },
    treatment_task_id: { type: mongoose.Schema.Types.ObjectId,
      required() { return this.type === "treatment"; } },
    care_schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: "CareSchedule" },
    feedback_id: { type: mongoose.Schema.Types.ObjectId, ref: "Feedback",
      required() { return this.type === "feedback_reply"; } },
    user_plant_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserPlant" },
    occurrence_date: String,
    type: { type: String, enum: ["treatment", "care", "feedback_reply"], default: "treatment" },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    scheduled_for: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "published", "sent", "cancelled"],
      default: "scheduled",
    },
    sent_at: { type: Date, default: null },
    published_at: Date,
    dispatch_managed: Boolean,
    cancelled_at: { type: Date, default: null },
    is_read: { type: Boolean, default: false },
    dedupe_key: { type: String, required: true, maxlength: 200 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

notificationSchema.index({ dedupe_key: 1 }, { unique: true });
notificationSchema.index({ status: 1, scheduled_for: 1 });
notificationSchema.index({ user_id: 1, scheduled_for: -1, _id: -1 });
notificationSchema.index({ treatment_schedule_id: 1, status: 1 });

module.exports = mongoose.model("Notification", notificationSchema, "notifications");
