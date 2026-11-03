const mongoose = require("mongoose");
const User = require("../models/user.model");
const ChatTurn = require("../models/chatTurn.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");

const evaluationEnabled = () => process.env.AI_EVALUATION_ENABLED === "true" ||
  (process.env.AI_EVALUATION_ENABLED === undefined && process.env.NODE_ENV !== "production");

const assertActive = async (userId) => {
  v.id(userId);
  const user = await User.findById(userId).select("status").lean();
  if (!user) throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
  if (!user.status) throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
};
const publicTurn = (turn) => ({
  id: String(turn._id), conversation_id: String(turn.conversation_id),
  question: turn.question, answer: turn.answer, answer_source: turn.answer_source,
  model: turn.model, prompt_version: turn.prompt_version,
  created_at: turn.created_at, evaluation_enabled: turn.evaluation_enabled,
  evaluation: turn.evaluation || { status: "not_requested" },
});
const assertConversation = async (userId, conversationId) => {
  if (!conversationId) return new mongoose.Types.ObjectId();
  v.id(conversationId, "conversation_id");
  const exists = await ChatTurn.exists({ user_id: userId, conversation_id: conversationId });
  if (!exists) throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy hội thoại.");
  return conversationId;
};
const saveTurn = async (input) => {
  const turn = await ChatTurn.create({ ...input, evaluation_enabled: evaluationEnabled(),
    evaluation: { status: evaluationEnabled() ? "not_requested" : "disabled" } });
  return publicTurn(turn);
};
const getTurn = async (userId, id) => {
  v.id(id);
  const turn = await ChatTurn.findOne({ _id: id, user_id: userId }).lean();
  if (!turn) throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy lượt chat.");
  return turn;
};
const list = async (userId, query) => {
  await assertActive(userId);
  const limit = v.positiveInteger(query.limit, 20, "limit", 50);
  let conversationId = query.conversation_id;
  if (conversationId) v.id(conversationId, "conversation_id");
  else {
    const latest = await ChatTurn.findOne({ user_id: userId }).sort({ _id: -1 }).select("conversation_id").lean();
    if (!latest) return { turns: [], conversation_id: null, next_cursor: null };
    conversationId = latest.conversation_id;
  }
  const filter = { user_id: userId, conversation_id: conversationId };
  if (query.before) filter._id = { $lt: v.id(query.before, "before") };
  const turns = await ChatTurn.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
  const hasMore = turns.length > limit;
  const page = turns.slice(0, limit);
  return { conversation_id: page.length ? String(conversationId) : null,
    next_cursor: hasMore ? String(page[page.length - 1]._id) : null,
    turns: page.reverse().map(publicTurn) };
};

module.exports = { assertActive, evaluationEnabled, assertConversation, saveTurn, getTurn, publicTurn, list };
