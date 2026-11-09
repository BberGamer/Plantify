const { createHash } = require("crypto");
const ChatTurn = require("../models/chatTurn.model");
const history = require("./chatHistory.service");
const AppError = require("../utils/app-error");
const v = require("../validators/common");

const metadata = (message, context, prompt, maxTokens = 800) => ({
  experiment_id: (process.env.AI_EXPERIMENT_ID || "").trim().slice(0, 80) || null,
  experiment_condition: ["before", "after"].includes(process.env.AI_EXPERIMENT_CONDITION) ? process.env.AI_EXPERIMENT_CONDITION : "unspecified",
  prompt_hash: createHash("sha256").update(prompt).digest("hex"),
  history_count: context.length,
  history_hash: createHash("sha256").update(JSON.stringify(context)).digest("hex"),
  generation_settings: { max_tokens: maxTokens, stream: false, temperature: "provider_default" },
});
const recordTiming = async (userId, id, input) => {
  await history.assertActive(userId);
  v.id(id); v.object(input);
  const ms = input.client_response_ms;
  if (!Number.isInteger(ms) || ms < 0 || ms > 3600000)
    v.invalid("client_response_ms", "Thời gian phải là số nguyên 0–3600000ms.");
  await history.getTurn(userId, id);
  const saved = await ChatTurn.findOneAndUpdate({ _id: id, user_id: userId, client_response_ms: null },
    { $set: { client_response_ms: ms, client_timing_method: "app_send_to_layout" } }, { new: true }).lean();
  const turn = saved || await history.getTurn(userId, id);
  return { message_id: id, client_response_ms: turn.client_response_ms, method: turn.client_timing_method };
};
const cell = (value) => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^\s*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
};
const toCsv = (turns) => {
  const columns = ["Test Case ID (manual)", "Condition", "Question", "Expected Answer (manual)", "Actual Answer", "Answer Source", "Accuracy 0-2 (manual)",
    "SLA seconds (manual)", "App Response seconds", "Pass/Fail (manual)", "Notes (manual)",
    "Tester (manual)", "Experiment ID", "Message ID", "Created At", "Backend Answer seconds", "Prompt Hash", "History Count", "FAQ Enabled", "Answer Model", "Generation Settings", "History Hash"];
  const rows = turns.map((turn) => {
    return [turn.test_case_id, turn.experiment_condition, turn.question, null,
      turn.answer, turn.answer_source, null, null, typeof turn.client_response_ms === "number" ? turn.client_response_ms / 1000 : null,
      null, null, null, turn.experiment_id, String(turn._id), turn.created_at?.toISOString?.() || turn.created_at,
      typeof turn.backend_answer_ms === "number" ? turn.backend_answer_ms / 1000 : null,
      turn.prompt_hash, turn.history_count, turn.faq_enabled, turn.model,
      turn.generation_settings ? JSON.stringify(turn.generation_settings) : null, turn.history_hash];
  });
  return "\uFEFF" + [columns, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
};
const exportReport = async (userId, query) => {
  await history.assertActive(userId);
  const experiment = v.text(query.experiment_id, "experiment_id");
  if (experiment.length > 80) v.invalid("experiment_id");
  const filter = { user_id: userId, experiment_id: experiment };
  if (query.condition !== undefined) {
    if (!["before", "after", "unspecified"].includes(query.condition)) v.invalid("condition");
    filter.experiment_condition = query.condition;
  }
  const turns = await ChatTurn.find(filter).sort({ _id: 1 }).limit(1001).lean();
  if (turns.length > 1000) throw new AppError("VALIDATION_ERROR", 400, "Phiên quá lớn. Vui lòng xuất theo điều kiện hoặc dùng mã phiên nhỏ hơn.");
  return toCsv(turns);
};

module.exports = { metadata, recordTiming, exportReport, toCsv };
