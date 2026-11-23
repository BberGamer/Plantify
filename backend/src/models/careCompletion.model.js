const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: "CareSchedule", required: true },
  date: { type: String, required: true },
  completed_at: { type: Date, default: Date.now },
});
schema.index({ schedule_id: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("CareCompletion", schema, "care_completions");
