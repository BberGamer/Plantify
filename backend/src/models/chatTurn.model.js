const mongoose = require("mongoose");

const chatTurnSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  conversation_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  answer_source: { type: String, enum: ["faq", "model"], required: true },
  model: String,
  prompt_version: String,
  faq_enabled: Boolean,
  test_case_id: String,
  experiment_id: String,
  experiment_condition: String,
  prompt_hash: String,
  history_count: Number,
  history_hash: String,
  generation_settings: mongoose.Schema.Types.Mixed,
  backend_answer_ms: Number,
  client_response_ms: { type: Number, default: null },
  client_timing_method: String,
  evaluation_enabled: Boolean,
  evaluation: { type: mongoose.Schema.Types.Mixed, default: () => ({ status: "disabled" }) },
  evaluation_attempts: { type: Number, default: 0 },
  evaluation_claim: String,
  evaluation_lease_until: Date,
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

chatTurnSchema.index({ user_id: 1, conversation_id: 1, _id: -1 });
chatTurnSchema.index({ user_id: 1, _id: -1 });

module.exports = mongoose.model("ChatTurn", chatTurnSchema, "chat_turns");
