const mongoose = require("mongoose");
const { Feedback } = require("../models/feedback.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const diagnosis = require("./diagnosis.service");
const photos = require("../integrations/diagnosis-photo.service");
const validate = require("../validators/common");
const AppError = require("../utils/app-error");
const { isVip } = require("../utils/vip");
const { notifyChanged } = require("./notification.service");
const fs = require("node:fs/promises");

const missing = () =>
  new AppError("FEEDBACK_NOT_FOUND", 404, "Không tìm thấy đóng góp.");
const latestFields =
  "_id user_id diagnosis_id type description images status review review_count created_at";

function serialize(row, manager = false) {
  const result = {
    _id: String(row._id),
    diagnosis_id: row.diagnosis_id ? String(row.diagnosis_id) : null,
    type: row.type,
    description: row.description,
    image_count: row.images.length,
    status: row.status,
    response: row.review?.response ?? null,
    reviewed_at: row.review?.reviewed_at ?? null,
    created_at: row.created_at,
  };
  if (manager) {
    result.sender = row.user_id
      ? { fullName: row.user_id.fullName, email: row.user_id.email }
      : null;
    result.review_count = row.review_count;
  }
  return result;
}

const populateSender = (query) => query.populate("user_id", "fullName email");
const filterFor = (id, userId) => ({
  _id: validate.id(id),
  ...(userId ? { user_id: userId } : {}),
});

async function assertVip(userId) {
  const user = await User.findOne({
    _id: userId,
    role: "customer",
    status: true,
  })
    .select("isproaccount vip_expires_at")
    .lean();
  if (!user)
    throw new AppError("FORBIDDEN", 403, "Tài khoản không còn hoạt động.");
  if (!isVip(user))
    throw new AppError(
      "FEEDBACK_VIP_REQUIRED",
      403,
      "Bạn cần gói VIP còn hạn để gửi đóng góp.",
    );
}

async function create(userId, input, files) {
  await Feedback.init();
  const key = { user_id: userId, request_key: input.request_key };
  const existing = await Feedback.findOne(key).select(latestFields).lean();
  if (existing) return serialize(existing);
  if (input.diagnosis_id)
    await diagnosis.historyDetail(userId, input.diagnosis_id);

  const images = [];
  let writeStarted = false;
  try {
    for (const file of files) images.push(await photos.save(file));
    await assertVip(userId);
    writeStarted = true;
    const created = await Feedback.create({
      ...key,
      diagnosis_id: input.diagnosis_id,
      type: input.diagnosis_id ? "diagnosis_feedback" : "proactive_feedback",
      description: input.description,
      images,
    });
    return serialize(created);
  } catch (error) {
    // Nếu kết nối mất giữa lúc ghi, kiểm tra DB trước khi dọn ảnh của yêu cầu.
    const winner = writeStarted
      ? await Feedback.findOne(key).select(latestFields).lean()
      : null;
    if (
      winner &&
      winner.images.some((image) =>
        images.some((saved) =>
          saved.filename
            ? saved.filename === image.filename
            : saved.public_id === image.public_id,
        ),
      )
    ) {
      return serialize(winner);
    }
    await Promise.allSettled(images.map((image) => photos.remove(image)));
    if (winner) return serialize(winner);
    throw error;
  }
}

async function list({ page, limit, filter, email }, userId) {
  const manager = !userId;
  if (!manager) filter.user_id = userId;
  if (email) {
    const sender = await User.findOne({ email }).select("_id").lean();
    if (!sender) return { feedbacks: [], page, limit, total: 0, totalPages: 0 };
    filter.user_id = sender._id;
  }
  const query = Feedback.find(filter)
    .select(latestFields)
    .sort({ created_at: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const [rows, total] = await Promise.all([
    (manager ? populateSender(query) : query).lean(),
    Feedback.countDocuments(filter),
  ]);
  return {
    feedbacks: rows.map((row) => serialize(row, manager)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

async function detail(id, userId) {
  const manager = !userId;
  const query = Feedback.findOne(filterFor(id, userId)).select(latestFields);
  const row = await (
    manager ? populateSender(query.select("review_history")) : query
  ).lean();
  if (!row) throw missing();
  if (manager)
    await Feedback.populate(row, {
      path: "review_history.manager_id",
      select: "fullName",
      options: { lean: true },
    });
  const result = serialize(row, manager);
  if (row.diagnosis_id) {
    try {
      result.diagnosis = await diagnosis.historyDetail(
        manager ? String(row.user_id?._id) : userId,
        String(row.diagnosis_id),
      );
    } catch (error) {
      if (!["DIAGNOSIS_HISTORY_NOT_FOUND", "INVALID_ID"].includes(error.code))
        throw error;
      result.diagnosis = null;
    }
  }
  if (manager)
    result.review_history = (row.review_history ?? []).map((item) => ({
      status: item.status,
      response: item.response,
      reviewed_at: item.reviewed_at,
      manager_name: item.manager_id?.fullName ?? null,
    }));
  return result;
}

async function review(id, managerId, input) {
  validate.id(id);
  const entry = {
    status: input.status,
    response: input.response,
    manager_id: managerId,
    reviewed_at: new Date(),
  };
  let userId;
  await mongoose.connection.transaction(async (session) => {
    const updated = await Feedback.findOneAndUpdate(
      { _id: id, review_count: input.review_count },
      {
        $set: { status: entry.status, review: entry },
        $inc: { review_count: 1 },
        $push: { review_history: entry },
      },
      { new: true, runValidators: true, session },
    )
      .select("user_id review_count")
      .lean();
    if (!updated) {
      if (!(await Feedback.exists({ _id: id }).session(session)))
        throw missing();
      throw new AppError(
        "FEEDBACK_REVIEW_CHANGED",
        409,
        "Đóng góp đã được cập nhật. Hãy tải lại trước khi xử lý.",
      );
    }
    await Notification.create(
      [
        {
          user_id: updated.user_id,
          feedback_id: updated._id,
          type: "feedback_reply",
          title: "Plantify đã phản hồi góp ý của bạn",
          message: "Mở ứng dụng để xem nội dung phản hồi.",
          scheduled_for: entry.reviewed_at,
          published_at: entry.reviewed_at,
          status: "published",
          dispatch_managed: true,
          dedupe_key: `feedback_reply:${updated._id}:${updated.review_count}`,
        },
      ],
      { session },
    );
    userId = updated.user_id;
  });
  notifyChanged(userId);
  return detail(id);
}

async function managerHistoryImage(id) {
  const row = await Feedback.findOne(filterFor(id))
    .select("user_id diagnosis_id")
    .lean();
  if (!row?.diagnosis_id) {
    throw new AppError(
      "DIAGNOSIS_HISTORY_NOT_FOUND",
      404,
      "Không tìm thấy kết quả đã liên kết.",
    );
  }
  return diagnosis.historyImage(String(row.user_id), String(row.diagnosis_id));
}

async function exportImages({ filter, email }) {
  if (filter.status && filter.status !== "accepted") throw new AppError("FEEDBACK_EXPORT_EMPTY", 404, "Không có ảnh từ feedback đã tiếp nhận phù hợp bộ lọc.");
  filter.status = "accepted";
  if (email) {
    const user = await User.findOne({ email }).select("_id").lean();
    if (!user) throw new AppError("FEEDBACK_EXPORT_EMPTY", 404, "Không có ảnh phù hợp bộ lọc.");
    filter.user_id = user._id;
  }
  const rows = await Feedback.find(filter).select("_id type created_at images").sort({ created_at: -1, _id: -1 }).limit(501).lean();
  if (rows.reduce((sum, row) => sum + row.images.length, 0) > 500 || rows.length > 500)
    throw new AppError("FEEDBACK_EXPORT_LIMIT", 413, "Vượt giới hạn 500 ảnh; hãy thu hẹp bộ lọc.");
  const images = [], errors = [], csv = ["ma_feedback,loai,ngay_gui,so_anh"];
  let total = 0;
  for (const row of rows) {
    const id = String(row._id);
    const day = new Date(row.created_at.getTime() + 7 * 3600000).toISOString().slice(0, 10).replace(/-/g, "/");
    csv.push(`${id},${row.type},${day},${row.images.length}`);
    for (const [i, image] of row.images.entries()) {
      try {
        const source = await photos.read(image);
        const buffer = Buffer.isBuffer(source) ? source : await fs.readFile(source);
        total += buffer.length;
        if (total > 500 * 1024 * 1024) throw new AppError("FEEDBACK_EXPORT_LIMIT", 413, "Vượt giới hạn 500 MB; hãy thu hẹp bộ lọc.");
        images.push({ id, day, index: i + 1, buffer });
      } catch (error) {
        if (error.code === "FEEDBACK_EXPORT_LIMIT") throw error;
        errors.push(`${id}/anh-${i + 1}.jpg: Không tải được ảnh`);
      }
    }
  }
  if (!images.length) throw new AppError("FEEDBACK_EXPORT_EMPTY", 404, "Không có ảnh phù hợp hoặc ảnh không còn khả dụng.");
  return { images, errors, csv: "\uFEFF" + csv.join("\r\n") };
}

async function image(id, index, userId) {
  if (!/^[0-4]$/.test(index)) throw missing();
  const row = await Feedback.findOne(filterFor(id, userId))
    .select("images")
    .lean();
  const item = row?.images?.[Number(index)];
  if (!item)
    throw new AppError(
      "FEEDBACK_IMAGE_NOT_FOUND",
      404,
      "Ảnh đóng góp không còn khả dụng.",
    );
  return photos.read(item);
}

module.exports = {
  assertVip,
  create,
  list,
  detail,
  review,
  image,
  managerHistoryImage,
  exportImages,
};
