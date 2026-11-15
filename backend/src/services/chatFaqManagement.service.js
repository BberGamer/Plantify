const { randomUUID } = require("node:crypto");
const ChatFaq = require("../models/chatFaq.model");
const ChatTurn = require("../models/chatTurn.model");
const { normalize } = require("./chatFaq.service");
const validate = require("../validators/chatFaq.validator");
const v = require("../validators/common");
const AppError = require("../utils/app-error");

const missing = () => new AppError("FAQ_NOT_FOUND", 404, "Không tìm thấy FAQ tiếng Việt.");
const conflict = () => new AppError("FAQ_DUPLICATE", 409, "Câu hỏi hoặc câu hỏi tương đương đã tồn tại trong FAQ khác.");
const stale = () => new AppError("FAQ_VERSION_CONFLICT", 409, "FAQ đã được thay đổi. Vui lòng tải lại trước khi thao tác.");
const fields = "id topic question aliases answer language version sources status";
const versionOf = item => Number.isSafeInteger(item.version) && item.version > 0 ? item.version : 1;
const present = item => ({ ...item, version: versionOf(item), status: item.status || "draft" });
// So khớp giá trị lưu thật, kể cả FAQ cũ thiếu version hoặc lưu version dạng chuỗi.
const revisionFilter = item => ({ _id: item._id, language: "vi",
  $expr: { $eq: [{ $ifNull: ["$version", null] }, { $literal: item.version ?? null }] } });
const keys = (data) => {
  const result = [data.question, ...data.aliases].map(normalize);
  if (result.some(key => !key)) v.invalid("question", "Câu hỏi cần có nội dung chữ.");
  if (new Set(result).size !== result.length)
    v.invalid("aliases", "Câu hỏi chính và các câu hỏi tương đương không được trùng nhau.");
  return result.map(key => `vi:${key}`);
};
const assertUnique = async (data, id) => {
  const normalized = keys(data);
  // Đối chiếu cả dữ liệu cũ chưa có match_keys; không tự sửa/import FAQ cũ.
  const others = await ChatFaq.find({ language: "vi", ...(id ? { _id: { $ne: id } } : {}) })
    .select("question aliases").lean();
  if (others.some(item => [item.question, ...(item.aliases || [])]
    .some(value => typeof value === "string" && normalized.includes(`vi:${normalize(value)}`)))) throw conflict();
  return normalized;
};
const list = async (input = {}) => {
  const page = v.positiveInteger(input.page, 1, "page", 100000);
  const limit = v.positiveInteger(input.limit, 20, "limit", 50);
  const filter = { language: "vi" };
  if (input.status && input.status !== "all") {
    if (!["draft", "approved"].includes(input.status)) v.invalid("status");
    filter.status = input.status;
  }
  if (input.search !== undefined) {
    const search = v.text(input.search, "search", false);
    if (search.length > 200) v.invalid("search");
    if (search) filter.$or = ["question", "aliases", "topic"].map(field => ({ [field]: new RegExp(v.escapeRegex(search), "i") }));
  }
  const [items, total] = await Promise.all([
    ChatFaq.find(filter).select(fields).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ChatFaq.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { items: items.map(present), pagination: { page, limit, total, totalPages,
    hasNextPage: page < totalPages, hasPrevPage: page > 1 && total > 0 } };
};
const rawDetail = async (id) => {
  v.id(id);
  const item = await ChatFaq.findOne({ _id: id, language: "vi" }).select(fields).lean();
  if (!item) throw missing();
  return item;
};
const detail = async id => present(await rawDetail(id));
const listTurns = async (input = {}) => {
  const page = v.positiveInteger(input.page, 1, "page", 100000);
  const limit = v.positiveInteger(input.limit, 20, "limit", 50);
  const filter = {};
  if (input.search !== undefined) {
    const search = v.text(input.search, "search", false);
    if (search.length > 200) v.invalid("search");
    if (search) filter.$or = ["question", "answer"].map(field => ({ [field]: new RegExp(v.escapeRegex(search), "i") }));
  }
  const [items, total] = await Promise.all([
    ChatTurn.find(filter).select("question answer answer_source created_at user_id conversation_id")
      .populate("user_id", "fullName")
      .sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ChatTurn.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { items: items.map(item => ({ ...item,
    user_id: item.user_id?._id || null,
    user_name: item.user_id?.fullName || "Người dùng không còn tồn tại",
  })), pagination: { page, limit, total, totalPages,
    hasNextPage: page < totalPages, hasPrevPage: page > 1 && total > 0 } };
};
const create = async (input) => {
  const data = validate.payload(input);
  const match_keys = await assertUnique(data);
  try {
    const item = await ChatFaq.create({ ...data, id: `faq-${randomUUID()}`, status: "draft", version: 1, match_keys });
    return detail(String(item._id));
  } catch (error) { if (error.code === 11000) throw conflict(); throw error; }
};
const update = async (id, input) => {
  const version = validate.revision(input);
  const current = await rawDetail(id);
  if (versionOf(current) !== version) throw stale();
  const data = validate.payload(input);
  const match_keys = await assertUnique(data, id);
  try {
    const item = await ChatFaq.findOneAndUpdate(revisionFilter(current),
      { $set: { ...data, status: "draft", match_keys, version: version + 1 } }, { new: true, runValidators: true }).select(fields).lean();
    if (!item) throw stale();
    return item;
  } catch (error) { if (error.code === 11000) throw conflict(); throw error; }
};
const setStatus = async (id, input, status) => {
  const version = validate.revision(input);
  const current = await rawDetail(id);
  if (versionOf(current) !== version) throw stale();
  // Gỡ duyệt luôn phải khả dụng, kể cả FAQ cũ bị trùng hoặc thiếu nội dung.
  const match_keys = status === "approved" ? await assertUnique(validate.payload(current), id) : null;
  try {
    const item = await ChatFaq.findOneAndUpdate(revisionFilter(current),
      { $set: { status, ...(match_keys ? { match_keys } : {}), version: version + 1 } }, { new: true, runValidators: true }).select(fields).lean();
    if (!item) throw stale();
    return item;
  } catch (error) { if (error.code === 11000) throw conflict(); throw error; }
};

const remove = async (id, input) => {
  const version = validate.revision(input);
  const current = await rawDetail(id);
  if (versionOf(current) !== version) throw stale();
  const result = await ChatFaq.deleteOne(revisionFilter(current));
  if (!result.deletedCount) throw stale();
  return { _id: id };
};

module.exports = { list, listTurns, detail, create, update, remove,
  approve: (id, input) => setStatus(id, input, "approved"),
  unapprove: (id, input) => setStatus(id, input, "draft") };
