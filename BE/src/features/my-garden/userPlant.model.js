// userPlant.model.js - Mongoose schema cho cây người dùng lưu trong My Garden
const mongoose = require('mongoose');

const USER_PLANT_STATUSES = ['active', 'archived'];

const albumImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    storageKey: { type: String, required: true },
    caption: { type: String, default: '' },
    capturedAt: { type: Date, default: null },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const careScheduleSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequencyDays: {
      type: Number,
      default: null,
      min: 1,
      max: 365,
      validate: {
        validator: (value) => value === null || Number.isInteger(value),
        message: 'frequencyDays phải là số nguyên',
      },
      required() {
        return this.enabled;
      },
    },
    lastCompletedAt: {
      type: Date,
      default: null,
    },
    nextDueAt: {
      type: Date,
      default: null,
      required() {
        return this.enabled;
      },
    },
  },
  { _id: false }
);

function defaultCareSchedule() {
  return {
    enabled: false,
    frequencyDays: null,
    lastCompletedAt: null,
    nextDueAt: null,
  };
}

const userPlantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    catalogPlantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    albumImages: {
      type: [albumImageSchema],
      default: [],
    },
    wateringSchedule: {
      type: careScheduleSchema,
      default: defaultCareSchedule,
    },
    fertilizingSchedule: {
      type: careScheduleSchema,
      default: defaultCareSchedule,
    },
    status: {
      type: String,
      enum: USER_PLANT_STATUSES,
      default: 'active',
    },
  },
  {
    collection: 'user_plants',
    timestamps: true,
  }
);

userPlantSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('UserPlant', userPlantSchema);
module.exports.USER_PLANT_STATUSES = USER_PLANT_STATUSES;
