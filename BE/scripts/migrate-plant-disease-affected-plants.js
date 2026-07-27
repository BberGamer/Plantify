// migrate-plant-disease-affected-plants.js
// Chuyển PlantDisease.plantId cũ sang affectedPlantIds[] và xóa field cũ
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

/**
 * Migration idempotent: chỉ xử lý document còn field plantId.
 */
async function migratePlantDiseaseAffectedPlants() {
  if (!process.env.MONGO_URI) {
    throw new Error('Chưa cấu hình MONGO_URI trong BE/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.collection('plant_diseases');

  const result = await collection.updateMany(
    { plantId: { $exists: true } },
    [
      {
        $set: {
          affectedPlantIds: {
            $cond: [
              { $ne: ['$plantId', null] },
              {
                $setUnion: [
                  { $ifNull: ['$affectedPlantIds', []] },
                  ['$plantId'],
                ],
              },
              { $ifNull: ['$affectedPlantIds', []] },
            ],
          },
        },
      },
      {
        $unset: 'plantId',
      },
    ]
  );

  const legacyPlantIndex = (await collection.indexes()).find(
    (index) => index.key?.plantId === 1
  );
  if (legacyPlantIndex) {
    await collection.dropIndex(legacyPlantIndex.name);
  }
  await collection.createIndex({ affectedPlantIds: 1 });

  console.log(
    `Migration hoàn tất: khớp ${result.matchedCount}, cập nhật ${result.modifiedCount} bản ghi.`
  );
}

migratePlantDiseaseAffectedPlants()
  .catch((error) => {
    console.error(`Migration thất bại: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
