// plantDisease.model.js - Mongoose schema cho PlantDisease
// Lưu trữ thông tin bệnh cây: triệu chứng, nguyên nhân, cách điều trị và phòng ngừa
const mongoose = require('mongoose');

const plantDiseaseSchema = new mongoose.Schema(
  {
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    collection: 'plant_diseases',
    id: false,
  }
);

plantDiseaseSchema.index({ plantId: 1 });

const PlantDisease = mongoose.model('PlantDisease', plantDiseaseSchema);

module.exports = PlantDisease;
