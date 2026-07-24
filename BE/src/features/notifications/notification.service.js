const mongoose = require('mongoose');
const { Notification } = require('./notification.model');

function ensureObjectId(id, message = 'ID không hợp lệ') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

const ORDER_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  packing: 'Đang đóng hàng',
  sented: 'Đã gửi hàng',
  succeeded: 'Đã nhận hàng',
  returning: 'Đang hoàn trả',
  cancelled: 'Đã hủy',
};

const CANCELLATION_REASON_LABELS = {
  out_of_stock: 'Hết hàng',
  defective_product: 'Hàng lỗi',
  weather_incident: 'Sự cố thời tiết',
  no_carrier: 'Không có người vận chuyển',
  customer_return: 'Khách hàng hoàn trả',
  customer_cancelled: 'Khách hàng chủ động hủy',
  payment_failed: 'Thanh toán không thành công',
};

async function createNotification(payload) {
  const { recipientId, actorId } = payload;

  ensureObjectId(recipientId, 'Recipient ID không hợp lệ');
  ensureObjectId(actorId, 'Actor ID không hợp lệ');

  if (String(recipientId) === String(actorId)) {
    return null;
  }

  return Notification.create(payload);
}

/**
 * Tạo thông báo khi đơn hàng được cập nhật trạng thái
 * @param {Object} order - Đơn hàng (phải có _id, userId, orderCode)
 * @param {string} newStatus - Trạng thái mới
 * @param {string} actorId - ID người thực hiện thay đổi (BM)
 */
async function createOrderNotification(order, newStatus, actorId) {
  if (!order || !order.userId || !actorId) {
    return null;
  }

  const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus;
  const reason = newStatus === 'cancelled'
    ? CANCELLATION_REASON_LABELS[order.cancellationReason]
    : null;
  const message = reason
    ? `Đơn hàng ${order.orderCode} đã bị hủy. Lý do: ${reason}`
    : `Đơn hàng ${order.orderCode} đã chuyển sang trạng thái: ${statusLabel}`;

  return createNotification({
    recipientId: order.userId,
    actorId,
    type: 'order_status_updated',
    orderId: order._id,
    message,
  });
}

async function getNotificationsByRecipient(recipientId, filters = {}) {
  ensureObjectId(recipientId, 'Recipient ID không hợp lệ');

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
    .populate('orderId', 'orderCode status total')
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
  ensureObjectId(recipientId, 'Recipient ID không hợp lệ');
  const unreadCount = await Notification.countDocuments({ recipientId, readAt: null });
  return { unreadCount };
}

async function markNotificationAsRead(notificationId, recipientId) {
  ensureObjectId(notificationId, 'Notification ID không hợp lệ');
  ensureObjectId(recipientId, 'Recipient ID không hợp lệ');

  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { readAt: new Date() },
    { new: true }
  )
    .populate('actorId', 'fullName avatarUrl email')
    .populate('postId', 'title')
    .populate('orderId', 'orderCode status total')
    .lean();
}

async function markAllNotificationsAsRead(recipientId) {
  ensureObjectId(recipientId, 'Recipient ID không hợp lệ');

  await Notification.updateMany(
    { recipientId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return getUnreadCount(recipientId);
}

module.exports = {
  createNotification,
  createOrderNotification,
  getNotificationsByRecipient,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

