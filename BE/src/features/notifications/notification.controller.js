// notification.controller.js - Xử lý request thông báo và kết nối SSE
const apiResponse = require('../../utils/apiResponse');
const notificationService = require('./notification.service');

function getCurrentUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId;
}

/** Lấy danh sách thông báo của người dùng hiện tại. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotificationsByRecipient(getCurrentUserId(req), req.query);
    return apiResponse.success(res, 'Lấy danh sách thông báo thành công', notifications);
  } catch (error) {
    return next(error);
  }
}

/** Lấy số thông báo chưa đọc. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getUnreadNotificationCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(getCurrentUserId(req));
    return apiResponse.success(res, 'Lấy số thông báo chưa đọc thành công', count);
  } catch (error) {
    return next(error);
  }
}

/** Đăng ký SSE thông báo và giữ response mở tới khi client ngắt. @param {Object} req @param {Object} res @returns {void} */
function streamNotificationEvents(req, res) {
  notificationService.subscribeNotificationEvents(req, res);
}

/** Đánh dấu một thông báo thuộc người dùng là đã đọc. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id, getCurrentUserId(req));

    if (!notification) {
      return apiResponse.notFound(res, 'Không tìm thấy thông báo');
    }

    return apiResponse.success(res, 'Đánh dấu đã đọc thành công', notification);
  } catch (error) {
    return next(error);
  }
}

/** Đánh dấu toàn bộ thông báo là đã đọc. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function markAllNotificationsAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllNotificationsAsRead(getCurrentUserId(req));
    return apiResponse.success(res, 'Đánh dấu tất cả đã đọc thành công', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getNotifications,
  getUnreadNotificationCount,
  streamNotificationEvents,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
