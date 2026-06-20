// careGuide.model.js - Mongoose schema cho CareGuide
// Chứa hướng dẫn tưới nước, nhân giống, cắt tỉa và thay chậu cho từng cây.
const mongoose = require('mongoose');

const careGuideSchema = new mongoose.Schema(
  {
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
    },
    pruning: {
      type: String,
      trim: true,
      default: '',
    },
    propagation: {
      type: String,
      trim: true,
      default: '',
    },
    watering: {
      type: String,
      trim: true,
      default: '',
    },
    repotting: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'care_guides',
    id: false,
  }
);

careGuideSchema.index({ plantId: 1 });

const CareGuide = mongoose.model('CareGuide', careGuideSchema);

module.exports = CareGuide;
