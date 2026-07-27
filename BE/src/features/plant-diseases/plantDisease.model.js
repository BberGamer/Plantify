// plantDisease.model.js - Mongoose schema cho kho tri thức bệnh cây
// Lưu canonical key, alias, kiến thức chăm sóc và sản phẩm được khuyến nghị
const mongoose = require('mongoose');

const DISEASE_CATEGORIES = [
  'disease',
  'pest',
  'nutrient',
  'environment',
  'unknown',
];

const plantDiseaseSchema = new mongoose.Schema(
  {
    affectedPlantIds: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant',
      }],
      default: [],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    diseaseKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    aliases: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: DISEASE_CATEGORIES,
      default: 'disease',
      lowercase: true,
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    causes: {
      type: [String],
      default: [],
    },
    treatments: {
      type: [String],
      default: [],
    },
    preventions: {
      type: [String],
      default: [],
    },
    recommendedProducts: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'plant_diseases',
    id: false,
    timestamps: true,
  }
);

plantDiseaseSchema.index({ affectedPlantIds: 1 });
plantDiseaseSchema.index(
  { diseaseKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      diseaseKey: { $type: 'string' },
    },
  }
);

const PlantDisease = mongoose.model('PlantDisease', plantDiseaseSchema);

module.exports = PlantDisease;
