// models/disease.model.js - Mongoose Schema cho danh mục bệnh cây
const mongoose = require("mongoose");

const PATHOGEN_TYPES = [
  "fungus",
  "bacteria",
  "virus",
  "pest",
  "nematode",
  "physiological",
  "other",
];

const DISEASE_STATUSES = ["active", "inactive"];

const diseaseSchema = new mongoose.Schema(
  {
    disease_name: {
      type: String,
      required: [true, "Tên bệnh là bắt buộc"],
      trim: true,
      maxlength: [150, "Tên bệnh không được vượt quá 150 ký tự"],
    },
    scientific_name: {
      type: String,
      trim: true,
      maxlength: [200, "Tên khoa học không được vượt quá 200 ký tự"],
      default: "",
    },
    pathogen_type: {
      type: String,
      enum: {
        values: PATHOGEN_TYPES,
        message: "Loại tác nhân gây bệnh không hợp lệ",
      },
      default: "other",
    },
    typical_symptoms: {
      type: String,
      required: [true, "Triệu chứng điển hình là bắt buộc"],
      trim: true,
      maxlength: [5000, "Triệu chứng điển hình không được vượt quá 5000 ký tự"],
    },
    environmental_cause: {
      type: String,
      trim: true,
      maxlength: [5000, "Nguyên nhân môi trường không được vượt quá 5000 ký tự"],
      default: "",
    },
    disease_image_url: {
      type: String,
      trim: true,
      maxlength: [2048, "URL ảnh bệnh không được vượt quá 2048 ký tự"],
      validate: {
        validator: (value) => !value || /^https?:\/\/\S+$/i.test(value),
        message: "URL ảnh bệnh không hợp lệ",
      },
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: DISEASE_STATUSES,
        message: "Trạng thái bệnh không hợp lệ",
      },
      default: "active",
    },
    treatment_protocol: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

// Tên bệnh không được trùng, không phân biệt chữ hoa/thường.
diseaseSchema.index(
  { disease_name: 1 },
  { unique: true, collation: { locale: "vi", strength: 2 } },
);

// Hỗ trợ tìm kiếm danh mục bệnh theo tên và triệu chứng.
diseaseSchema.index({
  disease_name: "text",
  scientific_name: "text",
  typical_symptoms: "text",
});

module.exports = mongoose.model("Disease", diseaseSchema, "plant_diseases");
