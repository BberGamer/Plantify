// plant.model.js
// Mongoose schema cho thông tin cây (collection: plants) theo đúng DB design
const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    scientificName: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    shortDescription: {
      type: String,
    },
    description: {
      type: String,
    },
    difficultyLevel: {
      type: String,
    },
    sunlight: {
      type: String,
    },
    humidity: {
      type: String,
    },
    temperatureMin: {
      type: Number,
    },
    temperatureMax: {
      type: Number,
    },
    origin: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    soil: {
      type: String,
    },
    toxicity: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
    collection: 'plants',
    id: false,
  }
);

const Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;
