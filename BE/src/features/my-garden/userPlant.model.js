// userPlant.model.js - Mongoose schema cho cây người dùng lưu trong My Garden
const mongoose = require('mongoose');

const USER_PLANT_STATUSES = ['active', 'archived'];

const userPlantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    catalogPlantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: USER_PLANT_STATUSES,
      default: 'active',
    },
  },
  {
    collection: 'user_plants',
    timestamps: true,
  }
);

userPlantSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('UserPlant', userPlantSchema);
module.exports.USER_PLANT_STATUSES = USER_PLANT_STATUSES;
