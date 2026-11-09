const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    treatment_schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreatmentSchedule",
      required: true,
    },
    treatment_task_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["treatment"], default: "treatment" },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    scheduled_for: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "sent", "cancelled"],
      default: "scheduled",
    },
    sent_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    is_read: { type: Boolean, default: false },
    dedupe_key: { type: String, required: true, maxlength: 200 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

notificationSchema.index({ dedupe_key: 1 }, { unique: true });
notificationSchema.index({ status: 1, scheduled_for: 1 });
notificationSchema.index({ user_id: 1, created_at: -1 });
notificationSchema.index({ treatment_schedule_id: 1, status: 1 });

module.exports = mongoose.model("Notification", notificationSchema, "notifications");
