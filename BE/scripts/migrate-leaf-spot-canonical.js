require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const PlantDisease = require('../src/features/plant-diseases/plantDisease.model');

const LEAF_SPOT_ALIASES = [
  'Đốm lá do nấm',
  'Đốm lá vàng và nâu',
  'Đốm vàng nâu',
  'Leaf spot',
  'Fungal leaf spot',
];

async function migrateLeafSpotCanonical() {
  await connectDB();

  const disease = await PlantDisease.findOne({
    $or: [
      { diseaseKey: { $in: ['dom-la', 'benh-dom-la'] } },
      { name: { $regex: /^(bệnh\s+)?đốm\s+lá$/i } },
      { aliases: { $in: ['Đốm lá', 'Leaf spot'] } },
    ],
  });

  if (!disease) {
    console.log('Không tìm thấy record Đốm lá để cập nhật.');
    return;
  }

  const aliases = [...new Set([
    ...(Array.isArray(disease.aliases) ? disease.aliases : []),
    ...LEAF_SPOT_ALIASES,
  ])];

  disease.category = 'disease';
  disease.diseaseKey = 'dom-la';
  disease.aliases = aliases;
  await disease.save();

  console.log(`Đã cập nhật canonical data cho Đốm lá (${disease._id}).`);
}

migrateLeafSpotCanonical()
  .catch((error) => {
    console.error('Migration Đốm lá thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
