// favorite.model.js - Mongoose schema cho Favorite (cây yêu thích của người dùng)
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'favorites',
  }
);

// Đảm bảo mỗi user chỉ lưu 1 lần mỗi cây
favoriteSchema.index({ userId: 1, plantId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
