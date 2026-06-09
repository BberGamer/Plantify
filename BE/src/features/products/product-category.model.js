// product-category.model.js - Mongoose schema cho ProductCategory
const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'productCategories',
  }
);

module.exports = mongoose.model('ProductCategory', productCategorySchema);
