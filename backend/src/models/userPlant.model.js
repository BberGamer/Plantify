const mongoose = require("mongoose");

const userPlantSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plant", default: null },
    plant_nickname: { type: String, required: true, trim: true, maxlength: 150 },
    custom_species_name: { type: String, trim: true, default: "", maxlength: 200 },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "PlantCategory", required: true },
    species_snapshot: {
      common_name: { type: String, default: "" },
      category_name: { type: String, default: "" },
      plant_image_url: { type: String, default: "" },
    },
    placement_location: { type: String, trim: true, default: "", maxlength: 200 },
    pot_type_size: { type: String, trim: true, default: "", maxlength: 200 },
    plant_image_url: {
      type: String, default: "", maxlength: 2048,
      validate: (value) => !value || /^https?:\/\/\S+$/i.test(value),
    },
    health_status: { type: String, enum: ["healthy", "treatment"], default: "healthy" },
    acquisition_date: { type: Date, default: null },
    archived_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

userPlantSchema.index({ user_id: 1, archived_at: 1, created_at: -1, _id: -1 });
module.exports = mongoose.model("UserPlant", userPlantSchema, "user_plants");
