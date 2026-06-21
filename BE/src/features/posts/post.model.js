// post.model.js - Mongoose schema cho bài viết Plantify
const mongoose = require('mongoose');

// Schema lưu nội dung blog/bài viết trong collection posts.
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      default: '',
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'posts',
    id: false,
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.index({ userId: 1 });

postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
  justOne: false,
  options: { sort: { createdAt: -1 } },
});

module.exports = mongoose.model('Post', postSchema);
