// report.model.js - Mongoose schema cho bao cao bai viet Plantify
const mongoose = require('mongoose');

const REPORT_REASONS = ['spam', 'sensitive', 'copyright', 'inappropriate', 'harassment', 'misinformation', 'other'];
const REPORT_STATUSES = ['pending', 'resolved'];
const REPORT_ACTIONS = ['approve', 'reject', 'remove'];

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'pending',
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      enum: REPORT_ACTIONS,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'report_post',
    id: false,
  }
);

reportSchema.index({ postId: 1, userId: 1 });

module.exports = mongoose.model('Report', reportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
module.exports.REPORT_STATUSES = REPORT_STATUSES;
module.exports.REPORT_ACTIONS = REPORT_ACTIONS;
