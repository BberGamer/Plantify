const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    scientificName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Indoor', 'Outdoor', 'Succulent', 'Herb', 'Flowering', 'Tree', 'Other'],
      default: 'Indoor',
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    waterFrequency: {
      type: String,
      required: true,
    },
    sunlight: {
      type: String,
      enum: ['Low', 'Partial', 'Bright Indirect', 'Full Sun'],
      default: 'Bright Indirect',
    },
    temperature: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Plant = mongoose.model('Plant', plantSchema);
module.exports = Plant;
