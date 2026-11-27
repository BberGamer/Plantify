const mongoose = require("mongoose");
const User = require("../models/user.model");
const ChatTurn = require("../models/chatTurn.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");

const assertActive = async (userId) => {
  v.id(userId);
  const user = await User.findById(userId).select("status").lean();
  if (!user)
    throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
  if (!user.status)
    throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
};
const publicTurn = (turn) => ({
  id: String(turn._id),
  conversation_id: String(turn.conversation_id),
  question: turn.question,
  answer: turn.answer,
  answer_source: turn.answer_source,
  sources: turn.sources || [],
  retrieval: turn.retrieval,
  model: turn.model,
  prompt_version: turn.prompt_version,
  created_at: turn.created_at,
  evaluation_enabled: false,
  backend_answer_ms: turn.backend_answer_ms,
  client_response_ms: turn.client_response_ms,
  test_case_id: turn.test_case_id,
  experiment_id: turn.experiment_id,
  experiment_condition: turn.experiment_condition,
  evaluation: { status: "disabled" },
});
const assertConversation = async (userId, conversationId) => {
  if (!conversationId) return new mongoose.Types.ObjectId();
  v.id(conversationId, "conversation_id");
  const exists = await ChatTurn.exists({
    user_id: userId,
    conversation_id: conversationId,
  });
  if (!exists)
    throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy hội thoại.");
  return conversationId;
};
const saveTurn = async (input) => {
  const turn = await ChatTurn.create({
    ...input,
    evaluation_enabled: false,
    evaluation: { status: "disabled" },
  });
  return publicTurn(turn);
};
const getTurn = async (userId, id) => {
  v.id(id);
  const turn = await ChatTurn.findOne({ _id: id, user_id: userId }).lean();
  if (!turn)
    throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy lượt chat.");
  return turn;
};
const recent = (userId, conversationId, limit) =>
  ChatTurn.find({ user_id: userId, conversation_id: conversationId })
    .select("question answer retrieval.method symptom_context")
    .sort({ _id: -1 })
    .limit(limit)
    .lean();
const list = async (userId, query) => {
  await assertActive(userId);
  const limit = v.positiveInteger(query.limit, 20, "limit", 50);
  let conversationId = query.conversation_id;
  if (conversationId) v.id(conversationId, "conversation_id");
  else {
    const latest = await ChatTurn.findOne({ user_id: userId })
      .sort({ _id: -1 })
      .select("conversation_id")
      .lean();
    if (!latest) return { turns: [], conversation_id: null, next_cursor: null };
    conversationId = latest.conversation_id;
  }
  const filter = { user_id: userId, conversation_id: conversationId };
  if (query.before) filter._id = { $lt: v.id(query.before, "before") };
  const turns = await ChatTurn.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();
  const hasMore = turns.length > limit;
  const page = turns.slice(0, limit);
  return {
    conversation_id: page.length ? String(conversationId) : null,
    next_cursor: hasMore ? String(page[page.length - 1]._id) : null,
    turns: page.reverse().map(publicTurn),
  };
};

const listManager = async (userId, query = {}) => {
  v.id(userId);
  const user = await User.findById(userId).select("role status").lean();
  if (!user)
    throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
  if (!user.status)
    throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
  if (!["admin", "manager"].includes(user.role))
    throw new AppError(
      "FORBIDDEN",
      403,
      "Bạn không có quyền xem chat người dùng.",
    );
  const page = v.positiveInteger(query.page, 1, "page", 100000);
  const limit = v.positiveInteger(query.limit, 20, "limit", 50);
  const filter = { "retrieval.method": { $ne: "customer" } };
  if (query.search !== undefined) {
    const search = v.text(query.search, "search", false);
    if (search.length > 200) v.invalid("search");
    if (search)
      filter.$or = ["question", "answer"].map((field) => ({
        [field]: new RegExp(v.escapeRegex(search), "i"),
      }));
  }
  const [items, total] = await Promise.all([
    ChatTurn.find(filter)
      .select("question answer answer_source created_at user_id sources")
      .populate("user_id", "fullName")
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ChatTurn.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    items: items.map((item) => ({
      ...item,
      user_id: item.user_id?._id || null,
      user_name: item.user_id?.fullName || "Người dùng không còn tồn tại",
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1 && total > 0,
    },
  };
};

module.exports = {
  assertActive,
  assertConversation,
  saveTurn,
  getTurn,
  recent,
  publicTurn,
  list,
  listManager,
};
