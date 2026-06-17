// plantDisease.model.js - Mongoose schema cho PlantDisease
// Lưu trữ thông tin bệnh cây: triệu chứng, nguyên nhân, cách điều trị và phòng ngừa
const mongoose = require('mongoose');

const plantDiseaseSchema = new mongoose.Schema(
  {
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
    symptoms: {
      type: String,
      default: '',
    },
    causes: {
      type: String,
      default: '',
    },
    treatment: {
      type: String,
      default: '',
    },
    prevention: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    affectedPlants: {
      type: [String],
      default: [],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'plant_diseases',
    id: false,
    strict: false,
  }
);

const PlantDisease = mongoose.model('PlantDisease', plantDiseaseSchema);

module.exports = PlantDisease;
