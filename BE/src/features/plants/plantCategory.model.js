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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Tự tạo `id` từ MongoDB `_id` nếu chưa có (Mongoose 5+ async)
plantCategorySchema.pre('save', async function () {
  if (!this.id) {
    this.id = this._id.toString();
  }
});

const PlantCategory = mongoose.model('PlantCategory', plantCategorySchema);

module.exports = PlantCategory;
