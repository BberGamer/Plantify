// models/plant.model.js - Mongoose Schema cho Plant
const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantCategory',
      required: [true, 'Danh mục là bắt buộc'],
    },
    common_name: {
      type: String,
      required: [true, 'Tên thường gọi là bắt buộc'],
      trim: true,
    },
    scientific_name: {
      type: String,
      required: [true, 'Tên khoa học là bắt buộc'],
      trim: true,
    },
    botanical_family: { type: String, default: '' },
    description: { type: String, default: '' },
    plant_image: { type: String, default: '' },
    care_requirements: { type: mongoose.Schema.Types.Mixed, default: {} },
    common_disease_ids: [{ type: mongoose.Schema.Types.ObjectId }],
    is_published: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('Plant', plantSchema, 'plants');
