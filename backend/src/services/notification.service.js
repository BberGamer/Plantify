const Notification = require("../models/notification.model");
const Treatment = require("../models/treatmentSchedule.model");
const Care = require("../models/careSchedule.model");
const Plant = require("../models/userPlant.model");
const User = require("../models/user.model");
const { Feedback } = require("../models/feedback.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const subscribers = new Map();

function subscribe(userId, listener) {
  const key = String(userId);
  const listeners = subscribers.get(key) || new Set();
  listeners.add(listener);
  subscribers.set(key, listeners);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) subscribers.delete(key);
  };
}

function notifyChanged(userId) {
  for (const listener of subscribers.get(String(userId)) || []) listener();
}

const fields =
  "title message scheduled_for is_read type treatment_schedule_id care_schedule_id user_plant_id occurrence_date feedback_id";
const visible = (userId, now = new Date()) => ({
  user_id: userId,
  scheduled_for: { $lte: now },
  // A previously read legacy reminder is already part of the user's history.
  $or: [
    { status: { $in: ["published", "sent"] } },
    { is_read: true },
    {
      status: "scheduled",
      dispatch_managed: { $exists: false },
      scheduled_for: { $lt: new Date(+now - 86400000) },
    },
  ],
});

async function summarize(userId, { from, until, unreadOnly, now, limit, offset }) {
  const filter = visible(userId, now);
  if (from) filter.scheduled_for.$gte = from;
  if (until) filter.scheduled_for.$lt = until;
  if (unreadOnly) filter.is_read = { $ne: true };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter)
      .select("title message scheduled_for is_read type")
      .sort({ scheduled_for: -1, _id: -1 })
      .skip(offset).limit(limit).maxTimeMS(4000).lean(),
    Notification.countDocuments(filter).maxTimeMS(4000),
    Notification.countDocuments({ ...filter, is_read: { $ne: true } }).maxTimeMS(4000),
  ]);
  return { items, total, unread };
}

const list = async (userId, query = {}) => {
  const page = v.positiveInteger(query.page, 1, "page", 100000);
  const limit = v.positiveInteger(query.limit, 20, "limit", 50);
  const filter = visible(userId);
  const [items, total] = await Promise.all([
    Notification.find(filter)
      .select(fields)
      .sort({ scheduled_for: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    items,
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

async function unreadCount(userId) {
  const count = await Notification.countDocuments({
    ...visible(userId),
    is_read: { $ne: true },
  });
  return { count };
}

async function detail(userId, id) {
  v.id(id);
  const item = await Notification.findOne({ ...visible(userId), _id: id })
    .select(fields)
    .lean();
  if (!item)
    throw new AppError(
      "NOTIFICATION_NOT_FOUND",
      404,
      "Không tìm thấy thông báo.",
    );
  if (item.type === "feedback_reply") {
    const available =
      item.feedback_id &&
      (await Feedback.exists({ _id: item.feedback_id, user_id: userId }));
    return { ...item, target_available: !!available };
  }
  const schedule =
    item.type === "care"
      ? await Care.findOne({
          _id: item.care_schedule_id,
          user_id: userId,
          is_active: true,
        })
          .select("user_plant_id")
          .lean()
      : await Treatment.findOne({
          _id: item.treatment_schedule_id,
          user_id: userId,
        })
          .select("user_plant_id")
          .lean();
  const available =
    schedule &&
    (await Plant.exists({
      _id: schedule.user_plant_id,
      user_id: userId,
      archived_at: null,
    }));
  return { ...item, target_available: !!available };
}

const markRead = async (userId, id) => {
  v.id(id);
  const item = await Notification.findOneAndUpdate(
    { ...visible(userId), _id: id },
    { $set: { is_read: true } },
    { new: true },
  )
    .select("_id is_read")
    .lean();
  if (!item)
    throw new AppError(
      "NOTIFICATION_NOT_FOUND",
      404,
      "Không tìm thấy thông báo.",
    );
  notifyChanged(userId);
  return item;
};

async function markAllRead(userId) {
  const { modifiedCount } = await Notification.updateMany(
    { ...visible(userId), is_read: { $ne: true } },
    { $set: { is_read: true } },
  );
  if (modifiedCount > 0) notifyChanged(userId);
  return { modifiedCount };
}

async function preferences(userId) {
  const user = await User.findById(userId)
    .select("notification_preferences")
    .lean();
  return {
    treatment_reminders:
      user?.notification_preferences?.treatment_reminders !== false,
  };
}

async function updatePreferences(userId, input) {
  v.object(input);
  const enabled = input.treatment_reminders;
  if (typeof enabled !== "boolean") v.invalid("treatment_reminders");
  const field = "notification_preferences.treatment_reminders";
  const update = { [field]: enabled };
  if (enabled)
    update["notification_preferences.treatment_reminders_enabled_at"] =
      new Date();
  await User.updateOne(
    { _id: userId, [field]: enabled ? false : { $ne: false } },
    { $set: update },
  );
  return preferences(userId);
}

module.exports = {
  list,
  summarize,
  unreadCount,
  detail,
  markRead,
  markAllRead,
  preferences,
  updatePreferences,
  subscribe,
  notifyChanged,
};
