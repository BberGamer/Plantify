// diagnosisHistory.model.js
// Định nghĩa schema lưu kết quả và thông tin liên quan của mỗi lần chẩn đoán cây.

const mongoose = require('mongoose');

const diagnosisHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userPlantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserPlant',
      default: null,
    },
    catalogPlantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      default: null,
    },
    image: {
      storageKey: { type: String, required: true, trim: true },
      url: { type: String, required: true, trim: true },
      mimeType: { type: String, required: true, trim: true },
      sizeBytes: { type: Number, required: true, min: 0 },
    },
    diagnosis: {
      diseaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlantDisease',
        default: null,
      },
      diseaseKey: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      category: {
        type: String,
        enum: ['disease', 'pest', 'nutrient', 'environment', 'healthy', 'unknown'],
        default: 'unknown',
        lowercase: true,
        trim: true,
      },
      rawDiseaseName: {
        type: String,
        default: '',
        trim: true,
      },
      observedSymptoms: {
        type: [String],
        default: [],
      },
      matchScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'unknown'],
        default: 'unknown',
      },
      affectedPart: {
        type: String,
        enum: ['leaf', 'stem', 'root', 'flower', 'whole_plant', 'unknown'],
        default: 'unknown',
      },
      description: {
        type: String,
        default: '',
        trim: true,
      },
      matchStatus: {
        type: String,
        enum: ['matched', 'unmatched', 'needs_review', 'low_confidence', 'unknown'],
        required: true,
      },
    },
    ai: {
      provider: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      rawResponse: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    recommendationSnapshot: {
      treatments: { type: [String], default: [] },
      preventions: { type: [String], default: [] },
      productIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
    },
    status: {
      type: String,
      enum: ['completed', 'failed'],
      default: 'completed',
    },
    failureReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    collection: 'diagnosis_histories',
    timestamps: true,
  }
);

diagnosisHistorySchema.index({ userId: 1, createdAt: -1 });
diagnosisHistorySchema.index({ userPlantId: 1, createdAt: -1 });
diagnosisHistorySchema.index({ 'diagnosis.diseaseKey': 1, createdAt: -1 });

module.exports = mongoose.model('DiagnosisHistory', diagnosisHistorySchema);
