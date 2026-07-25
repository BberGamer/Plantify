const apiResponse = require('../../utils/apiResponse');
const notificationService = require('./notification.service');

function getCurrentUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId;
}

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotificationsByRecipient(getCurrentUserId(req), req.query);
    return apiResponse.success(res, 'Lấy danh sách thông báo thành công', notifications);
  } catch (error) {
    return next(error);
  }
}

async function getUnreadNotificationCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(getCurrentUserId(req));
    return apiResponse.success(res, 'Lấy số thông báo chưa đọc thành công', count);
  } catch (error) {
    return next(error);
  }
}

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
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
