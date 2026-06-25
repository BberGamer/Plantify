const mongoose = require('mongoose');
const { Notification } = require('./notification.model');

function ensureObjectId(id, message = 'ID khong hop le') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

async function createNotification(payload) {
  const { recipientId, actorId } = payload;

  ensureObjectId(recipientId, 'Recipient ID khong hop le');
  ensureObjectId(actorId, 'Actor ID khong hop le');

  if (String(recipientId) === String(actorId)) {
    return null;
  }

  return Notification.create(payload);
}

async function getNotificationsByRecipient(recipientId, filters = {}) {
  ensureObjectId(recipientId, 'Recipient ID khong hop le');

  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 50);
  const query = { recipientId };

  if (filters.unreadOnly === 'true' || filters.unreadOnly === true) {
    query.readAt = null;
  }

  const total = await Notification.countDocuments(query);
  const pages = Math.max(Math.ceil(total / limit), 1);

  const notifications = await Notification.find(query)
    .populate('actorId', 'fullName avatarUrl email')
    .populate('postId', 'title')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    notifications,
    total,
    pages,
    currentPage: page,
  };
}

async function getUnreadCount(recipientId) {
  ensureObjectId(recipientId, 'Recipient ID khong hop le');
  const unreadCount = await Notification.countDocuments({ recipientId, readAt: null });
  return { unreadCount };
}

async function markNotificationAsRead(notificationId, recipientId) {
  ensureObjectId(notificationId, 'Notification ID khong hop le');
  ensureObjectId(recipientId, 'Recipient ID khong hop le');

  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { readAt: new Date() },
    { new: true }
  )
    .populate('actorId', 'fullName avatarUrl email')
    .populate('postId', 'title')
    .lean();
}

async function markAllNotificationsAsRead(recipientId) {
  ensureObjectId(recipientId, 'Recipient ID khong hop le');

  await Notification.updateMany(
    { recipientId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return getUnreadCount(recipientId);
}

module.exports = {
  createNotification,
  getNotificationsByRecipient,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
