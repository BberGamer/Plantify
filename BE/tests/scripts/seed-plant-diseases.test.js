// seed-plant-diseases.test.js - Kiểm tra chất lượng và tính idempotent của seed bệnh cây.
const mongoose = require('mongoose');
const PlantDisease = require('../../src/features/plant-diseases/plantDisease.model');
const {
  PLANT_DISEASE_SEED_DATA,
} = require('../../src/features/plant-diseases/plantDisease.seedData');
const {
  buildSeedOperations,
  buildSeedRecords,
  resolveAffectedPlantIds,
  validateSeedRecords,
} = require('../../scripts/seed-plant-diseases');
const {
  chooseDiseaseMatch,
} = require('../../src/features/ai/aiDiagnosisOrchestrator.service');

function plant(name, scientificName, tags = []) {
  return {
    _id: new mongoose.Types.ObjectId(),
    name,
    scientificName,
    tags,
  };
}

const plants = [
  plant('Monstera', 'Monstera deliciosa', ['Cây trong nhà']),
  plant('Hoa hồng', 'Rosa spp.', ['Cây ngoài trời']),
  plant('Sen đá nâu', "Echeveria 'Black Prince'", ['Xương rồng']),
  plant('Cau vàng', 'Dypsis lutescens', ['Cây lọc không khí']),
  plant('Bạc hà', 'Mentha spp.', ['Cây ngoài trời']),
  plant('Sanh Bonsai', 'Ficus microcarpa', ['bonsai']),
  plant('Rêu Java', 'Taxiphyllum barbieri', ['Cây thủy sinh', 'Ưa nước']),
];

describe('PlantDisease seed data', () => {
  test('có độ phủ lớn, diseaseKey duy nhất và đúng schema', () => {
    const records = buildSeedRecords(plants);
    const categories = new Set(records.map((record) => record.category));

    expect(PLANT_DISEASE_SEED_DATA.length).toBeGreaterThanOrEqual(40);
    expect(categories).toEqual(new Set([
      'disease',
      'pest',
      'nutrient',
      'environment',
    ]));
    expect(() => validateSeedRecords(records, PlantDisease)).not.toThrow();
  });

  test('liên kết cây theo nhóm và matcher riêng thay vì gắn mọi bệnh cho mọi cây', () => {
    const leafSpot = PLANT_DISEASE_SEED_DATA.find(
      (entry) => entry.diseaseKey === 'dom-la'
    );
    const nitrogen = PLANT_DISEASE_SEED_DATA.find(
      (entry) => entry.diseaseKey === 'thieu-dam'
    );
    const roseBlackSpot = PLANT_DISEASE_SEED_DATA.find(
      (entry) => entry.diseaseKey === 'dom-den-hoa-hong'
    );

    expect(resolveAffectedPlantIds(leafSpot, plants)).toHaveLength(plants.length - 1);
    expect(resolveAffectedPlantIds(nitrogen, plants)).toHaveLength(plants.length);
    expect(resolveAffectedPlantIds(roseBlackSpot, plants)).toEqual([
      plants[1]._id,
    ]);
  });

  test('tạo bulk upsert và giữ ảnh, sản phẩm đã được quản trị viên gắn', () => {
    const [record] = buildSeedRecords(plants);
    const [operation] = buildSeedOperations([record]);

    expect(operation.updateOne).toEqual(expect.objectContaining({
      filter: { diseaseKey: record.diseaseKey },
      upsert: true,
      timestamps: false,
    }));
    expect(operation.updateOne.update.$set).not.toHaveProperty('plantGroups');
    expect(operation.updateOne.update.$set).not.toHaveProperty('plantMatchers');
    expect(operation.updateOne.update.$setOnInsert).toEqual({
      images: [],
      recommendedProducts: [],
    });
    expect(operation.updateOne.update.$set).not.toHaveProperty('images');
    expect(operation.updateOne.update.$set).not.toHaveProperty('recommendedProducts');
  });

  test('mọi tên và alias trong seed đều match đúng canonical disease của AI Doctor', () => {
    const records = buildSeedRecords(plants);

    records.forEach((expectedDisease) => {
      const candidates = records.filter(
        (candidate) => candidate.category === expectedDisease.category
      );

      [expectedDisease.name, ...expectedDisease.aliases].forEach((condition) => {
        const result = chooseDiseaseMatch({
          suspectedCondition: condition,
          observedSymptoms: [expectedDisease.symptoms[0]],
        }, candidates);

        expect({
          condition,
          matchStatus: result.matchStatus,
          diseaseKey: result.disease?.diseaseKey,
        }).toEqual({
          condition,
          matchStatus: 'matched',
          diseaseKey: expectedDisease.diseaseKey,
        });
      });
    });
  });
});
