const mongoose = require("mongoose");

const favoritePlantSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plant", required: true },
  free_slot: { type: Number, min: 0, max: 4 },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

favoritePlantSchema.index({ user_id: 1, plant_id: 1 }, { unique: true });
favoritePlantSchema.index({ user_id: 1, free_slot: 1 }, {
  unique: true,
  partialFilterExpression: { free_slot: { $type: "number" } },
});
favoritePlantSchema.index({ user_id: 1, created_at: -1, _id: -1 });

module.exports = mongoose.model("FavoritePlant", favoritePlantSchema, "favorite_plants");
