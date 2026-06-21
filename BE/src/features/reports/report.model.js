// report.model.js - Mongoose schema cho bao cao bai viet Plantify
const mongoose = require('mongoose');

const REPORT_REASONS = ['spam', 'harassment', 'inappropriate', 'misinformation', 'other'];
const REPORT_STATUSES = ['pending', 'reviewed', 'resolved', 'rejected'];

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
  },
  {
    timestamps: true,
    collection: 'reports',
    id: false,
  }
);

reportSchema.index({ postId: 1, userId: 1 });

module.exports = mongoose.model('Report', reportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
module.exports.REPORT_STATUSES = REPORT_STATUSES;
