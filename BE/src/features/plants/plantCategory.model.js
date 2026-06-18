// plantCategory.model.js
// Mongoose schema cho danh mục cây (collection: plant_categories)
const mongoose = require('mongoose');

const plantCategorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'plant_categories',
    id: false,
  }
);

const PlantCategory = mongoose.model('PlantCategory', plantCategorySchema);

module.exports = PlantCategory;
