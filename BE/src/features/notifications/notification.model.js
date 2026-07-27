// notification.model.js
// Định nghĩa schema thông báo và các loại thông báo được gửi đến người dùng.

const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'post_commented',
  'post_reported_under_review',
  'order_status_updated',
  'plant_watering_due',
  'plant_fertilizing_due',
];

const PLANT_CARE_NOTIFICATION_TYPES = [
  'plant_watering_due',
  'plant_fertilizing_due',
];

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      required() {
        const notificationType = this.type
          || this.get?.('type')
          || this.getUpdate?.()?.$setOnInsert?.type;
        return !PLANT_CARE_NOTIFICATION_TYPES.includes(notificationType);
      },
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    userPlantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserPlant',
      default: null,
    },
    careDueAt: {
      type: Date,
      default: null,
    },
    dedupeKey: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, readAt: 1 });
notificationSchema.index(
  { dedupeKey: 1 },
  {
    unique: true,
    partialFilterExpression: { dedupeKey: { $type: 'string' } },
  }
);

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NOTIFICATION_TYPES,
  PLANT_CARE_NOTIFICATION_TYPES,
};
