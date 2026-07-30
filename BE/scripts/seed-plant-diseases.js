// seed-plant-diseases.js - Seed idempotent kho tri thức bệnh cây cho AI Doctor.
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plant = require('../src/features/plants/plant.model');
const PlantDisease = require('../src/features/plant-diseases/plantDisease.model');
const {
  PLANT_DISEASE_SEED_DATA,
} = require('../src/features/plant-diseases/plantDisease.seedData');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});

const ALLOWED_CATEGORIES = new Set([
  'disease',
  'pest',
  'nutrient',
  'environment',
]);

const PLANT_GROUP_MATCHERS = {
  aquatic: [
    'thuy sinh',
    'ua nuoc',
    'echinodorus',
    'ceratophyllum',
    'taxiphyllum',
    'hemianthus',
    'nelumbo',
  ],
  succulent: [
    'xuong rong',
    'sen da',
    'mong nuoc',
    'crassula',
    'aloe',
    'haworthia',
    'echeveria',
    'adenium',
    'euphorbia',
    'opuntia',
    'cereus',
    'mammillaria',
  ],
  flowering: [
    'hoa hong',
    'hoa nhai',
    'hoa giay',
    'hong mon',
    'lan y',
    'cam tu cau',
    'cuc',
    'da yen thao',
    'dam but',
    'mai chieu thuy',
    'rosa',
    'jasminum',
    'bougainvillea',
    'anthurium',
    'spathiphyllum',
    'hydrangea',
    'chrysanthemum',
    'petunia',
    'hibiscus',
    'wrightia',
  ],
  tropicalFoliage: [
    'trong nha',
    'noi that',
    'loc khong khi',
    'ban lam viec',
    'phong thuy',
    'monstera',
    'epipremnum',
    'philodendron',
    'aglaonema',
    'alocasia',
    'dieffenbachia',
    'calathea',
    'fittonia',
    'ficus lyrata',
    'ficus elastica',
    'dracaena',
    'chlorophytum',
    'hedera',
    'zamioculcas',
    'schefflera',
  ],
  woody: [
    'bonsai',
    'tao dang',
    'cay ngoai troi',
    'ficus',
    'acer',
    'terminalia',
    'barringtonia',
    'premna',
    'podocarpus',
    'cupressus',
    'antidesma',
    'vernonia',
  ],
  herb: [
    'bac ha',
    'huong thao',
    'mentha',
    'rosmarinus',
  ],
  palm: [
    'cau vang',
    'co canh',
    'dypsis',
    'rhapis',
  ],
};

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPlantSearchText(plant = {}) {
  return normalizeSearchText([
    plant.name,
    plant.scientificName,
    ...(Array.isArray(plant.tags) ? plant.tags : []),
  ].filter(Boolean).join(' '));
}

function matchesAny(searchText, matchers = []) {
  return matchers.some((matcher) => {
    const normalizedMatcher = normalizeSearchText(matcher);
    return normalizedMatcher && searchText.includes(normalizedMatcher);
  });
}

function matchesPlantGroup(plant, group) {
  if (group === 'all') return true;

  const searchText = getPlantSearchText(plant);
  const isAquatic = matchesAny(searchText, PLANT_GROUP_MATCHERS.aquatic);
  if (group === 'terrestrial') return !isAquatic;

  return matchesAny(searchText, PLANT_GROUP_MATCHERS[group] || []);
}

function resolveAffectedPlantIds(seedEntry, plants = []) {
  const groups = Array.isArray(seedEntry.plantGroups)
    ? seedEntry.plantGroups
    : [];
  const explicitMatchers = Array.isArray(seedEntry.plantMatchers)
    ? seedEntry.plantMatchers
    : [];

  return plants
    .filter((plant) => (
      groups.some((group) => matchesPlantGroup(plant, group))
      || matchesAny(getPlantSearchText(plant), explicitMatchers)
    ))
    .map((plant) => plant._id);
}

function buildSeedRecords(plants = [], seedData = PLANT_DISEASE_SEED_DATA) {
  return seedData.map((seedEntry) => {
    const {
      plantGroups,
      plantMatchers,
      ...knowledge
    } = seedEntry;

    return {
      ...knowledge,
      affectedPlantIds: resolveAffectedPlantIds(seedEntry, plants),
      isActive: true,
    };
  });
}

function validateSeedRecords(records, PlantDiseaseModel = PlantDisease) {
  const keys = new Set();
  const matchTerms = new Map();

  records.forEach((record) => {
    if (keys.has(record.diseaseKey)) {
      throw new Error(`Seed có diseaseKey trùng: ${record.diseaseKey}`);
    }
    keys.add(record.diseaseKey);

    if (!ALLOWED_CATEGORIES.has(record.category)) {
      throw new Error(`Category không hợp lệ ở ${record.diseaseKey}: ${record.category}`);
    }

    ['aliases', 'symptoms', 'causes', 'treatments', 'preventions'].forEach((field) => {
      if (!Array.isArray(record[field]) || record[field].length === 0) {
        throw new Error(`${record.diseaseKey}.${field} phải là mảng không rỗng`);
      }
    });

    [record.name, ...record.aliases].forEach((term) => {
      const normalizedTerm = normalizeSearchText(term);
      const existingKey = matchTerms.get(normalizedTerm);
      if (existingKey && existingKey !== record.diseaseKey) {
        throw new Error(
          `Tên/alias "${term}" bị trùng giữa ${existingKey} và ${record.diseaseKey}`
        );
      }
      matchTerms.set(normalizedTerm, record.diseaseKey);
    });

    const validationError = new PlantDiseaseModel(record).validateSync();
    if (validationError) {
      throw new Error(
        `Seed ${record.diseaseKey} không đúng schema: ${validationError.message}`
      );
    }
  });

  return true;
}

function buildSeedOperations(records) {
  return records.map((record) => ({
    updateOne: {
      filter: { diseaseKey: record.diseaseKey },
      update: {
        $set: record,
        $setOnInsert: {
          images: [],
          recommendedProducts: [],
        },
      },
      upsert: true,
      timestamps: false,
    },
  }));
}

async function seedPlantDiseases({
  dryRun = false,
  PlantModel = Plant,
  PlantDiseaseModel = PlantDisease,
  logger = console,
} = {}) {
  const plants = await PlantModel.find()
    .select('_id name scientificName tags')
    .lean();
  const records = buildSeedRecords(plants);

  validateSeedRecords(records, PlantDiseaseModel);

  const unlinked = records.filter((record) => record.affectedPlantIds.length === 0);
  if (unlinked.length > 0) {
    logger.warn(
      `[Seed PlantDisease] ${unlinked.length} tình trạng chưa khớp cây: `
      + unlinked.map((record) => record.diseaseKey).join(', ')
    );
  }

  const summary = {
    dryRun,
    plantCount: plants.length,
    diseaseCount: records.length,
    linkedDiseaseCount: records.length - unlinked.length,
    totalPlantLinks: records.reduce(
      (total, record) => total + record.affectedPlantIds.length,
      0
    ),
    matchedCount: 0,
    modifiedCount: 0,
    upsertedCount: 0,
  };

  if (!dryRun) {
    const result = await PlantDiseaseModel.bulkWrite(
      buildSeedOperations(records),
      { ordered: false }
    );
    summary.matchedCount = result.matchedCount || 0;
    summary.modifiedCount = result.modifiedCount || 0;
    summary.upsertedCount = result.upsertedCount || 0;
  }

  logger.log(
    `[Seed PlantDisease] ${dryRun ? 'Dry run' : 'Hoàn tất'}: `
    + `${summary.diseaseCount} tình trạng, ${summary.plantCount} cây, `
    + `${summary.totalPlantLinks} liên kết, ${summary.upsertedCount} thêm mới, `
    + `${summary.modifiedCount} cập nhật.`
  );

  return summary;
}

async function runCli() {
  if (!process.env.MONGO_URI) {
    throw new Error('Chưa cấu hình MONGO_URI trong BE/.env');
  }

  const dryRun = process.argv.includes('--dry-run');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await seedPlantDiseases({ dryRun });
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runCli().catch(async (error) => {
    console.error(`[Seed PlantDisease] Thất bại: ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

module.exports = {
  PLANT_GROUP_MATCHERS,
  buildSeedOperations,
  buildSeedRecords,
  getPlantSearchText,
  matchesPlantGroup,
  normalizeSearchText,
  resolveAffectedPlantIds,
  seedPlantDiseases,
  validateSeedRecords,
};
