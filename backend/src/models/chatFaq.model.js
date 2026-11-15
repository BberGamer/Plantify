const mongoose = require("mongoose");

const chatFaqSchema = new mongoose.Schema({
  id: { type: String, required: true },
  topic: String,
  question: { type: String, required: true },
  aliases: { type: [String], default: [] },
  answer: { type: String, required: true },
  language: { type: String, default: "vi" },
  version: { type: Number, default: 1 },
  sources: { type: [mongoose.Schema.Types.Mixed], default: [] },
  status: { type: String, enum: ["draft", "approved"], default: "draft" },
  match_keys: { type: [String], default: undefined },
});

// Multikey unique index bảo vệ câu hỏi/alias của các FAQ quản lý mới khi ghi đồng thời.
chatFaqSchema.index({ match_keys: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("ChatFaq", chatFaqSchema, "chat_faqs");
