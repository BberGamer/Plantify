// models/plantCategory.model.js - Mongoose Schema cho PlantCategory
const mongoose = require('mongoose');

const plantCategorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      unique: true,
      trim: true,
    },
    scientific_reference: { type: String, default: '' },
    description: { type: String, default: '' },
    category_image: { type: String, default: '' },
    is_published: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

module.exports = mongoose.model('PlantCategory', plantCategorySchema, 'plant_categories');
