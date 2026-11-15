const Notification = require("../models/notification.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");

const visible = (userId) => ({
  user_id: userId,
  status: { $in: ["scheduled", "sent"] },
  scheduled_for: { $lte: new Date() },
});

const list = async (userId, query = {}) => {
  const page = v.positiveInteger(query.page, 1, "page", 100000);
  const limit = v.positiveInteger(query.limit, 20, "limit", 50);
  const filter = visible(userId);
  const [items, total] = await Promise.all([
    Notification.find(filter)
      .select("title message scheduled_for is_read treatment_schedule_id")
      .sort({ scheduled_for: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { items, pagination: { page, limit, total, totalPages,
    hasNextPage: page < totalPages, hasPrevPage: page > 1 && total > 0 } };
};

const markRead = async (userId, id) => {
  v.id(id);
  const item = await Notification.findOneAndUpdate(
    { ...visible(userId), _id: id }, { $set: { is_read: true } }, { new: true },
  ).select("_id is_read").lean();
  if (!item) throw new AppError("NOTIFICATION_NOT_FOUND", 404, "Không tìm thấy thông báo.");
  return item;
};

module.exports = { list, markRead };
