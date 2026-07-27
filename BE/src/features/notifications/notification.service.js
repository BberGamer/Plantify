// notification.service.js - Xử lý và phát thông báo theo thời gian thực
const mongoose = require('mongoose');
const { Notification } = require('./notification.model');

const HEARTBEAT_INTERVAL_MS = 25000;
const INITIAL_CHANGE_STREAM_RETRY_MS = 1000;
const MAX_CHANGE_STREAM_RETRY_MS = 30000;
const notificationEventClients = new Set();
let notificationChangeStream = null;
let changeStreamRetryTimer = null;
let changeStreamRetryAttempt = 0;
let changeStreamDisabled = false;
let realtimeShuttingDown = false;

async function populateNotification(notificationId) {
  return Notification.findById(notificationId)
    .populate('actorId', 'fullName avatarUrl email')
    .populate('postId', 'title')
    .populate('orderId', 'orderCode status total')
    .populate('userPlantId', 'name coverImageUrl')
    .lean();
}

/**
 * Đóng một SSE client theo cách idempotent và giải phóng toàn bộ listener/timer.
 */
function closeNotificationClient(client, { endResponse = false } = {}) {
  if (!client) return;
  if (client.closed) {
    if (endResponse && !client.res.destroyed && !client.res.writableEnded) {
      client.res.end();
    }
    return;
  }

  client.closed = true;
  clearInterval(client.heartbeat);
  notificationEventClients.delete(client);
  client.req.off('aborted', client.cleanup);
  client.req.off('close', client.cleanup);
  client.res.off('close', client.cleanup);
  client.res.off('error', client.cleanup);

  if (endResponse && !client.res.destroyed && !client.res.writableEnded) {
    client.res.end();
  }

  if (notificationEventClients.size === 0 && !realtimeShuttingDown) {
    void stopNotificationChangeStream();
  }
}

/**
 * Ghi dữ liệu SSE nếu socket còn mở; trả false nếu client đã ngắt.
 */
function writeNotificationEvent(client, payload) {
  if (
    !client
    || client.closed
    || client.res.destroyed
    || client.res.writableEnded
  ) {
    closeNotificationClient(client);
    return false;
  }

  try {
    client.res.write(payload);
    return true;
  } catch {
    closeNotificationClient(client);
    return false;
  }
}

function publishNotificationCreated(notification) {
  if (!notification) return;

  const recipientId = String(notification.recipientId?._id || notification.recipientId);
  const data = JSON.stringify({ notification });

  for (const client of [...notificationEventClients]) {
    if (client.userId === recipientId) {
      writeNotificationEvent(
        client,
        `event: notification.created\ndata: ${data}\n\n`
      );
    }
  }
}

/**
 * Nhận diện MongoDB standalone hoặc lỗi server không hỗ trợ Change Stream.
 */
function isUnsupportedChangeStreamError(error = {}) {
  const message = String(error.message || '').toLowerCase();
  return [20, 40573, 40615].includes(Number(error.code))
    || message.includes('change stream is only supported')
    || message.includes('$changestream stage is only supported')
    || (
      message.includes('change stream')
      && message.includes('replica set')
    );
}

function disableUnsupportedChangeStream(error) {
  changeStreamDisabled = true;
  clearTimeout(changeStreamRetryTimer);
  changeStreamRetryTimer = null;
  console.info(
    '[Notification Realtime] MongoDB không hỗ trợ Change Stream; '
    + 'SSE vẫn hoạt động qua luồng tạo thông báo của ứng dụng.',
    error?.message || ''
  );
}

/**
 * Đóng Change Stream hiện tại mà không để lỗi close ảnh hưởng backend.
 */
async function stopNotificationChangeStream() {
  clearTimeout(changeStreamRetryTimer);
  changeStreamRetryTimer = null;

  const stream = notificationChangeStream;
  notificationChangeStream = null;
  if (!stream) return;

  try {
    await stream.close();
  } catch (error) {
    if (!isUnsupportedChangeStreamError(error)) {
      console.warn('[Notification Realtime] Không thể đóng Change Stream:', error);
    }
  }
}

/**
 * Hẹn khởi động lại Change Stream với backoff khi lỗi có khả năng phục hồi.
 */
function scheduleChangeStreamRestart() {
  if (
    realtimeShuttingDown
    || changeStreamDisabled
    || changeStreamRetryTimer
    || notificationEventClients.size === 0
  ) {
    return;
  }

  const delay = Math.min(
    INITIAL_CHANGE_STREAM_RETRY_MS * (2 ** changeStreamRetryAttempt),
    MAX_CHANGE_STREAM_RETRY_MS
  );
  changeStreamRetryAttempt += 1;
  changeStreamRetryTimer = setTimeout(() => {
    changeStreamRetryTimer = null;
    startNotificationChangeStream();
  }, delay);
  changeStreamRetryTimer.unref?.();
}

function handleChangeStreamFailure(stream, error) {
  if (stream && notificationChangeStream !== stream) return;
  if (stream) notificationChangeStream = null;

  if (isUnsupportedChangeStreamError(error)) {
    disableUnsupportedChangeStream(error);
    void Promise.resolve(stream?.close?.()).catch(() => {});
    return;
  }

  if (error) {
    console.warn('[Notification Realtime] MongoDB Change Stream bị gián đoạn:', error);
  }
  void Promise.resolve(stream?.close?.()).catch(() => {});
  scheduleChangeStreamRestart();
}

/**
 * Mở Change Stream dùng chung; MongoDB standalone sẽ tự chuyển sang publish nội bộ.
 */
function startNotificationChangeStream() {
  if (
    notificationChangeStream
    || changeStreamDisabled
    || realtimeShuttingDown
    || notificationEventClients.size === 0
  ) {
    return;
  }

  const topologyType = mongoose.connection.client?.topology?.description?.type;
  if (topologyType === 'Single') {
    disableUnsupportedChangeStream();
    return;
  }

  let stream;
  try {
    stream = Notification.watch([
      { $match: { operationType: 'insert' } },
    ]);
    notificationChangeStream = stream;
  } catch (error) {
    handleChangeStreamFailure(null, error);
    return;
  }

  stream.on('change', async (change) => {
    try {
      const notification = await populateNotification(change.documentKey._id);
      changeStreamRetryAttempt = 0;
      publishNotificationCreated(notification);
    } catch (error) {
      console.warn('[Notification Realtime] Không thể đọc thông báo mới:', error);
    }
  });
  stream.on('error', (error) => handleChangeStreamFailure(stream, error));
  stream.once('close', () => handleChangeStreamFailure(stream));
}

/**
 * Mở kết nối SSE để nhận thông báo theo thời gian thực.
 */
function subscribeNotificationEvents(req, res) {
  const client = {
    req,
    res,
    userId: String(req.user.id),
    heartbeat: null,
    closed: false,
    cleanup: null,
  };
  client.cleanup = () => closeNotificationClient(client);

  res.status(200);
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
  notificationEventClients.add(client);
  req.once('aborted', client.cleanup);
  req.once('close', client.cleanup);
  res.once('close', client.cleanup);
  res.once('error', client.cleanup);

  if (!writeNotificationEvent(client, 'event: connected\ndata: {}\n\n')) {
    return;
  }
  if (client.closed) return;

  client.heartbeat = setInterval(() => {
    writeNotificationEvent(client, ': keep-alive\n\n');
  }, HEARTBEAT_INTERVAL_MS);
  client.heartbeat.unref?.();
  startNotificationChangeStream();
}

/**
 * Đóng toàn bộ SSE và Change Stream trước khi backend shutdown.
 */
async function shutdownNotificationRealtime() {
  realtimeShuttingDown = true;
  clearTimeout(changeStreamRetryTimer);
  changeStreamRetryTimer = null;

  for (const client of [...notificationEventClients]) {
    writeNotificationEvent(client, 'event: server.shutdown\ndata: {}\n\n');
    closeNotificationClient(client, { endResponse: true });
  }

  await stopNotificationChangeStream();
}

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
  if (actorId !== null && actorId !== undefined) {
    ensureObjectId(actorId, 'Actor ID không hợp lệ');
    if (String(recipientId) === String(actorId)) {
      return null;
    }
  }

  const createdNotification = await Notification.create(payload);
  const notification = await populateNotification(createdNotification._id);
  publishNotificationCreated(notification);
  return notification;
}

async function upsertPlantCareNotification(payload) {
  ensureObjectId(payload.recipientId, 'Recipient ID không hợp lệ');
  ensureObjectId(payload.userPlantId, 'UserPlant ID không hợp lệ');
  if (!payload.dedupeKey) {
    const error = new Error('dedupeKey là bắt buộc');
    error.statusCode = 400;
    throw error;
  }

  let result;
  try {
    result = await Notification.updateOne(
      { dedupeKey: payload.dedupeKey },
      { $setOnInsert: payload },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }

  if (!result?.upsertedCount || !result.upsertedId) return null;

  const notification = await populateNotification(result.upsertedId);
  publishNotificationCreated(notification);
  return notification;
}

/**
 * Tạo thông báo khi đơn hàng được cập nhật trạng thái
 * @param {Object} order - Đơn hàng (phải có _id, userId, orderCode)
 * @param {string} newStatus - Trạng thái mới
 * @param {string} actorId - ID người thực hiện thay đổi (BM)
 * @param {number} [refundedAmount=0] - Số tiền được hoàn vào ví (nếu có)
 */
async function createOrderNotification(order, newStatus, actorId, refundedAmount = 0) {
  if (!order || !order.userId || !actorId) {
    return null;
  }

  const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus;
  const reason = newStatus === 'cancelled'
    ? CANCELLATION_REASON_LABELS[order.cancellationReason]
    : null;

  let message;
  if (reason) {
    message = `Đơn hàng ${order.orderCode} đã bị hủy. Lý do: ${reason}`;
    if (refundedAmount > 0) {
      const formattedAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(refundedAmount);
      message += `. Đã hoàn ${formattedAmount} vào ví của bạn.`;
    }
  } else {
    message = `Đơn hàng ${order.orderCode} đã chuyển sang trạng thái: ${statusLabel}`;
  }

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
    .populate('userPlantId', 'name coverImageUrl')
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
    .populate('userPlantId', 'name coverImageUrl')
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
  upsertPlantCareNotification,
  createOrderNotification,
  getNotificationsByRecipient,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeNotificationEvents,
  shutdownNotificationRealtime,
};

