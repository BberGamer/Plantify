const express = require('express');
const notificationController = require('./notification.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorizeCustomer);
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadNotificationCount);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);
router.patch('/:id/read', notificationController.markNotificationAsRead);

module.exports = router;
