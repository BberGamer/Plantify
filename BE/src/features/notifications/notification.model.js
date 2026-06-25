const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'post_commented',
  'post_reported_under_review',
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
      required: true,
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

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NOTIFICATION_TYPES,
};
