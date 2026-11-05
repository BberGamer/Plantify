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
});

module.exports = mongoose.model("ChatFaq", chatFaqSchema, "chat_faqs");
