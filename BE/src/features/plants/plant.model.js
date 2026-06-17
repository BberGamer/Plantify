// plant.model.js - Mongoose schema cho Plant và PlantCategory
// - PlantCategory: danh mục phân loại cây (collection: plant_categories)
// - Plant: thông tin cây và hướng dẫn chăm sóc (collection: plants)
const mongoose = require('mongoose');

// Schema danh mục cây trong collection plant_categories.
const plantCategorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'plant_categories',
    id: false,
    strict: false,
  }
);

// Schema thông tin cây và hướng dẫn chăm sóc trong collection plants.
const plantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    categoryId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    scientificName: {
      type: String,
      trim: true,
      default: '',
    },
    commonNames: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    difficultyLevel: {
      type: String,
      trim: true,
      default: '',
    },
    sunlight: {
      type: String,
      trim: true,
      default: '',
    },
    watering: {
      type: String,
      trim: true,
      default: '',
    },
    humidity: {
      type: String,
      trim: true,
      default: '',
    },
    temperature: {
      type: String,
      trim: true,
      default: '',
    },
    soilType: {
      type: String,
      default: '',
    },
    origin: {
      type: String,
      default: '',
    },
    fertilizer: {
      type: String,
      default: '',
    },
    toxicity: {
      type: String,
      trim: true,
      default: '',
    },
    growthRate: {
      type: String,
      trim: true,
      default: '',
    },
    matureSize: {
      type: String,
      trim: true,
      default: '',
    },
    propagation: {
      type: String,
      default: '',
    },
    pruning: {
      type: String,
      default: '',
    },
    repotting: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    careTips: {
      type: [String],
      default: [],
    },
    commonProblems: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isIndoor: {
      type: Boolean,
      default: true,
    },
    isPetFriendly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'plants',
    id: false,
    strict: false,
  }
);

const PlantCategory = mongoose.model('PlantCategory', plantCategorySchema);
const Plant = mongoose.model('Plant', plantSchema);

module.exports = { Plant, PlantCategory };
