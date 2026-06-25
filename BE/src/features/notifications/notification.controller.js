const apiResponse = require('../../utils/apiResponse');
const notificationService = require('./notification.service');

function getCurrentUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId;
}

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotificationsByRecipient(getCurrentUserId(req), req.query);
    return apiResponse.success(res, 'Lay danh sach thong bao thanh cong', notifications);
  } catch (error) {
    return next(error);
  }
}

async function getUnreadNotificationCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(getCurrentUserId(req));
    return apiResponse.success(res, 'Lay so thong bao chua doc thanh cong', count);
  } catch (error) {
    return next(error);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id, getCurrentUserId(req));

    if (!notification) {
      return apiResponse.notFound(res, 'Khong tim thay thong bao');
    }

    return apiResponse.success(res, 'Danh dau da doc thanh cong', notification);
  } catch (error) {
    return next(error);
  }
}

async function markAllNotificationsAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllNotificationsAsRead(getCurrentUserId(req));
    return apiResponse.success(res, 'Danh dau tat ca da doc thanh cong', result);
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
