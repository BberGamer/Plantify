const mongoose = require("mongoose");

const careScheduleSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user_plant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlant",
      required: true,
    },
    action_type: {
      type: String,
      enum: ["watering", "fertilizing", "inspection", "other"],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    start_date: { type: String, default: null },
    end_date: { type: String, default: null },
    time: { type: String, default: "08:00" },
    repeat_every_days: { type: Number, min: 1, max: 365, default: 1 },
    notes: { type: String, maxlength: 1000, default: "" },
    is_paused: { type: Boolean, default: false },
    pause_reason: {
      type: String,
      enum: ["manual", "treatment", null],
      default: null,
    },
    paused_by_treatment_schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreatmentSchedule",
      default: null,
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

careScheduleSchema.index({ user_plant_id: 1, is_active: 1, is_paused: 1 });
careScheduleSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model("CareSchedule", careScheduleSchema, "care_schedules");
