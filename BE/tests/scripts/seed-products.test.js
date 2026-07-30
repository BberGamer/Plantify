const mongoose = require('mongoose');

const Product = require('../../src/features/products/product.model');
const {
  PRODUCT_CATEGORY_SEED_DATA,
  PRODUCT_SEED_DATA,
} = require('../../src/features/products/product.seedData');
const {
  PLANT_DISEASE_SEED_DATA,
} = require('../../src/features/plant-diseases/plantDisease.seedData');
const {
  buildProductOperations,
  buildProductRecords,
  buildDiseaseRecommendationOperations,
  getSeedCoverage,
  validateProductRecords,
  validateProductSeedData,
} = require('../../scripts/seed-products');

describe('product seed data', () => {
  const categoryIdMap = new Map(
    PRODUCT_CATEGORY_SEED_DATA.map((category) => [
      category.slug,
      new mongoose.Types.ObjectId(),
    ])
  );

  test('contains a broad catalog and covers every seeded plant condition', () => {
    expect(PRODUCT_SEED_DATA.length).toBeGreaterThanOrEqual(30);
    expect(
      PRODUCT_CATEGORY_SEED_DATA.some(
        (category) => category.slug === 'bao-ve-thuc-vat'
      )
    ).toBe(true);

    expect(() =>
      validateProductSeedData(PRODUCT_SEED_DATA, PRODUCT_CATEGORY_SEED_DATA)
    ).not.toThrow();

    const coverage = getSeedCoverage(PRODUCT_SEED_DATA);
    const seededDiseaseKeys = new Set(
      PLANT_DISEASE_SEED_DATA.map((disease) => disease.diseaseKey)
    );
    const missingDiseaseKeys = [...seededDiseaseKeys].filter(
      (diseaseKey) => !coverage.diseaseKeys.has(diseaseKey)
    );
    const unknownDiseaseKeys = [...coverage.diseaseKeys].filter(
      (diseaseKey) => !seededDiseaseKeys.has(diseaseKey)
    );

    expect(missingDiseaseKeys).toEqual([]);
    expect(unknownDiseaseKeys).toEqual([]);
    expect(coverage.diseaseKeys.size).toBe(PLANT_DISEASE_SEED_DATA.length);
  });

  test('builds records accepted by the Product schema', () => {
    const records = buildProductRecords(categoryIdMap, PRODUCT_SEED_DATA);

    expect(records).toHaveLength(PRODUCT_SEED_DATA.length);
    expect(() => validateProductRecords(records, Product)).not.toThrow();
  });

  test('updates managed guidance without overwriting inventory or media', () => {
    const records = buildProductRecords(categoryIdMap, PRODUCT_SEED_DATA);
    const operations = buildProductOperations(records);

    expect(operations).toHaveLength(PRODUCT_SEED_DATA.length);

    for (const operation of operations) {
      const update = operation.updateOne.update;

      expect(operation.updateOne.upsert).toBe(true);
      expect(operation.updateOne.timestamps).toBe(false);
      expect(update.$set.seedKey).toBeTruthy();
      expect(update.$set.price).toBeUndefined();
      expect(update.$set.stock).toBeUndefined();
      expect(update.$set.images).toBeUndefined();
      expect(update.$set.thumbnail).toBeUndefined();
      expect(update.$setOnInsert.price).toBeGreaterThan(0);
      expect(update.$setOnInsert.stock).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(update.$setOnInsert.images)).toBe(true);
    }
  });

  test('replaces managed recommendations but preserves manual products', () => {
    const oldManagedId = new mongoose.Types.ObjectId();
    const currentManagedId = new mongoose.Types.ObjectId();
    const manualId = new mongoose.Types.ObjectId();
    const diseaseId = new mongoose.Types.ObjectId();

    const operations = buildDiseaseRecommendationOperations({
      diseases: [
        {
          _id: diseaseId,
          diseaseKey: 'fungal-leaf-spot',
          recommendedProducts: [oldManagedId, manualId],
        },
      ],
      seededProducts: [
        {
          _id: currentManagedId,
          seedKey: 'dong-oxycloride',
        },
      ],
      allManagedProductIds: [oldManagedId, currentManagedId],
      seedData: [
        {
          seedKey: 'dong-oxycloride',
          recommendedDiseaseKeys: ['fungal-leaf-spot'],
        },
      ],
    });

    expect(operations).toHaveLength(1);
    expect(operations[0].updateOne.timestamps).toBe(false);
    expect(
      operations[0].updateOne.update.$set.recommendedProducts.map(String)
    ).toEqual([String(manualId), String(currentManagedId)]);
  });

  test('keeps the seed identity internal to the API model', () => {
    const seedKeyPath = Product.schema.path('seedKey');

    expect(seedKeyPath.options.unique).toBe(true);
    expect(seedKeyPath.options.sparse).toBe(true);
    expect(seedKeyPath.options.select).toBe(false);
  });
});
