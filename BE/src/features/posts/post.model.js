// post.model.js - Mongoose schema cho bài viết Plantify
const mongoose = require('mongoose');

// Schema lưu nội dung blog/bài viết trong collection posts.
const postSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
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
    excerpt: {
      type: String,
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
    },
    tags: {
      type: [String],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'posts',
    id: false,
    strict: false,
  }
);

module.exports = mongoose.model('Post', postSchema);
