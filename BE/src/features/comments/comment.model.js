// comment.model.js - Mongoose schema cho binh luan bai viet Plantify
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'comments',
    id: false,
    strict: false,
  }
);

module.exports = mongoose.model('Comment', commentSchema);
