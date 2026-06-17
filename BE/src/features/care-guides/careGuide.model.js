// careGuide.model.js - Mongoose schema cho CareGuide
// Chứa hướng dẫn chăm sóc cây: tưới nước, bón phân, cắt tỉa, theo mùa
const mongoose = require('mongoose');

const careGuideSchema = new mongoose.Schema(
  {
    plantId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'all'],
      default: 'all',
    },
    wateringFrequency: {
      type: String,
      default: '',
    },
    fertilizingFrequency: {
      type: String,
      default: '',
    },
    pruningNotes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'care_guides',
    id: false,
    strict: false,
  }
);

const CareGuide = mongoose.model('CareGuide', careGuideSchema);

module.exports = CareGuide;
