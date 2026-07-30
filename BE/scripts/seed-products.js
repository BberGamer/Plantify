// seed-products.js - Seed idempotent sản phẩm và liên kết khuyến nghị cho AI Doctor.
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../src/features/products/product.model');
const ProductCategory = require('../src/features/products/product-category.model');
const PlantDisease = require('../src/features/plant-diseases/plantDisease.model');
const {
  PRODUCT_CATEGORY_SEED_DATA,
  PRODUCT_SEED_DATA,
} = require('../src/features/products/product.seedData');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});

function uniqueIds(values = []) {
  const result = new Map();
  values.forEach((value) => {
    const id = value?._id || value;
    if (id) result.set(String(id), id);
  });
  return [...result.values()];
}

function validateProductSeedData(
  seedData = PRODUCT_SEED_DATA,
  categoryData = PRODUCT_CATEGORY_SEED_DATA
) {
  const categorySlugs = new Set(categoryData.map((category) => category.slug));
  const seedKeys = new Set();
  const productNames = new Set();

  seedData.forEach((entry) => {
    if (!entry.seedKey || seedKeys.has(entry.seedKey)) {
      throw new Error(`seedKey sản phẩm thiếu hoặc trùng: ${entry.seedKey}`);
    }
    seedKeys.add(entry.seedKey);

    const normalizedName = String(entry.name || '').trim().toLocaleLowerCase('vi');
    if (!normalizedName || productNames.has(normalizedName)) {
      throw new Error(`Tên sản phẩm thiếu hoặc trùng: ${entry.name}`);
    }
    productNames.add(normalizedName);

    if (!categorySlugs.has(entry.categorySlug)) {
      throw new Error(
        `Sản phẩm ${entry.seedKey} dùng categorySlug chưa khai báo: ${entry.categorySlug}`
      );
    }

    if (!Number.isFinite(entry.price) || entry.price < 0) {
      throw new Error(`Giá không hợp lệ ở ${entry.seedKey}`);
    }
    if (!Number.isInteger(entry.stock) || entry.stock < 0) {
      throw new Error(`Tồn kho không hợp lệ ở ${entry.seedKey}`);
    }
    if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
      throw new Error(`${entry.seedKey}.tags phải là mảng không rỗng`);
    }
    if (
      !Array.isArray(entry.recommendedDiseaseKeys)
      || entry.recommendedDiseaseKeys.length === 0
    ) {
      throw new Error(
        `${entry.seedKey}.recommendedDiseaseKeys phải là mảng không rỗng`
      );
    }
  });

  return true;
}

function buildCategoryOperations(
  categoryData = PRODUCT_CATEGORY_SEED_DATA
) {
  return categoryData.map((category) => ({
    updateOne: {
      filter: { slug: category.slug },
      update: { $setOnInsert: category },
      upsert: true,
      timestamps: false,
    },
  }));
}

function buildProductRecords(
  categoryIdBySlug,
  seedData = PRODUCT_SEED_DATA
) {
  return seedData.map((entry) => {
    const {
      categorySlug,
      recommendedDiseaseKeys,
      ...product
    } = entry;
    const categoryId = categoryIdBySlug.get(categorySlug);
    if (!categoryId) {
      throw new Error(
        `Không tìm thấy category ${categorySlug} cho ${entry.seedKey}`
      );
    }

    return {
      ...product,
      categoryId,
      isActive: true,
    };
  });
}

function validateProductRecords(records, ProductModel = Product) {
  records.forEach((record) => {
    const validationError = new ProductModel(record).validateSync();
    if (validationError) {
      throw new Error(
        `Seed ${record.seedKey} không đúng Product schema: ${validationError.message}`
      );
    }
  });
  return true;
}

function buildProductOperations(
  records,
  seedData = PRODUCT_SEED_DATA
) {
  const seedByKey = new Map(seedData.map((entry) => [entry.seedKey, entry]));

  return records.map((record) => {
    const seedEntry = seedByKey.get(record.seedKey);
    const {
      price,
      stock,
      ...managedFields
    } = record;

    return {
      updateOne: {
        filter: {
          $or: [
            { seedKey: record.seedKey },
            { name: seedEntry.name },
          ],
        },
        update: {
          $set: managedFields,
          $setOnInsert: {
            price,
            stock,
            thumbnail: '',
            images: [],
            soldCount: 0,
            ratingAverage: 0,
            ratingCount: 0,
          },
        },
        upsert: true,
        timestamps: false,
      },
    };
  });
}

function getProductsByDiseaseKey(
  seededProducts,
  seedData = PRODUCT_SEED_DATA
) {
  const productIdBySeedKey = new Map(
    seededProducts.map((product) => [product.seedKey, product._id])
  );
  const result = new Map();

  seedData.forEach((entry) => {
    const productId = productIdBySeedKey.get(entry.seedKey);
    if (!productId) {
      throw new Error(`Không tìm thấy sản phẩm vừa seed: ${entry.seedKey}`);
    }

    entry.recommendedDiseaseKeys.forEach((diseaseKey) => {
      const currentIds = result.get(diseaseKey) || [];
      result.set(diseaseKey, uniqueIds([...currentIds, productId]));
    });
  });

  return result;
}

function buildDiseaseRecommendationOperations({
  diseases,
  seededProducts,
  allManagedProductIds,
  seedData = PRODUCT_SEED_DATA,
}) {
  const managedIdSet = new Set(
    allManagedProductIds.map((productId) => String(productId))
  );
  const productsByDiseaseKey = getProductsByDiseaseKey(
    seededProducts,
    seedData
  );

  return diseases
    .filter((disease) => productsByDiseaseKey.has(disease.diseaseKey))
    .map((disease) => {
      const manualProductIds = (disease.recommendedProducts || [])
        .filter((productId) => !managedIdSet.has(String(productId)));
      const seedProductIds = productsByDiseaseKey.get(disease.diseaseKey);

      return {
        updateOne: {
          filter: { _id: disease._id },
          update: {
            $set: {
              recommendedProducts: uniqueIds([
                ...manualProductIds,
                ...seedProductIds,
              ]),
            },
          },
          timestamps: false,
        },
      };
    });
}

function getSeedCoverage(seedData = PRODUCT_SEED_DATA) {
  const diseaseKeys = new Set(
    seedData.flatMap((entry) => entry.recommendedDiseaseKeys)
  );
  const recommendationCount = seedData.reduce(
    (total, entry) => total + entry.recommendedDiseaseKeys.length,
    0
  );

  return {
    diseaseKeys,
    recommendationCount,
  };
}

async function getCategoryIdMap(ProductCategoryModel = ProductCategory) {
  const categories = await ProductCategoryModel.find()
    .select('_id slug')
    .lean();
  return new Map(
    categories.map((category) => [category.slug, category._id])
  );
}

async function seedProducts({
  dryRun = false,
  ProductModel = Product,
  ProductCategoryModel = ProductCategory,
  PlantDiseaseModel = PlantDisease,
  logger = console,
} = {}) {
  validateProductSeedData();

  const [existingCategories, existingProducts, diseases] = await Promise.all([
    ProductCategoryModel.find().select('_id name slug').lean(),
    ProductModel.find().select('+seedKey name').lean(),
    PlantDiseaseModel.find()
      .select('_id diseaseKey recommendedProducts isActive')
      .lean(),
  ]);

  const existingCategoryBySlug = new Map(
    existingCategories.map((category) => [category.slug, category])
  );
  const existingProductBySeedKey = new Map(
    existingProducts
      .filter((product) => product.seedKey)
      .map((product) => [product.seedKey, product])
  );
  const existingProductNames = new Set(
    existingProducts.map(
      (product) => String(product.name || '').trim().toLocaleLowerCase('vi')
    )
  );
  const activeDiseaseKeys = new Set(
    diseases
      .filter((disease) => disease.isActive !== false)
      .map((disease) => disease.diseaseKey)
  );
  const coverage = getSeedCoverage();
  const missingDiseaseKeys = [...coverage.diseaseKeys]
    .filter((diseaseKey) => !activeDiseaseKeys.has(diseaseKey));

  if (missingDiseaseKeys.length > 0) {
    throw new Error(
      'Thiếu PlantDisease cho mapping sản phẩm: '
      + `${missingDiseaseKeys.join(', ')}. Hãy chạy seed:plant-diseases trước.`
    );
  }

  const categoryToCreate = PRODUCT_CATEGORY_SEED_DATA.filter(
    (category) => !existingCategoryBySlug.has(category.slug)
  ).length;
  const productToCreate = PRODUCT_SEED_DATA.filter((entry) => (
    !existingProductBySeedKey.has(entry.seedKey)
    && !existingProductNames.has(entry.name.trim().toLocaleLowerCase('vi'))
  )).length;

  const summary = {
    dryRun,
    categoryCount: PRODUCT_CATEGORY_SEED_DATA.length,
    categoryUpsertedCount: categoryToCreate,
    productCount: PRODUCT_SEED_DATA.length,
    productUpsertedCount: productToCreate,
    productModifiedCount: 0,
    mappedDiseaseCount: coverage.diseaseKeys.size,
    recommendationCount: coverage.recommendationCount,
    diseaseModifiedCount: 0,
  };

  if (dryRun) {
    const temporaryCategoryMap = new Map(
      PRODUCT_CATEGORY_SEED_DATA.map((category) => [
        category.slug,
        existingCategoryBySlug.get(category.slug)?._id
          || new mongoose.Types.ObjectId(),
      ])
    );
    const records = buildProductRecords(temporaryCategoryMap);
    validateProductRecords(records, ProductModel);
  } else {
    const categoryResult = await ProductCategoryModel.bulkWrite(
      buildCategoryOperations(),
      { ordered: false }
    );
    summary.categoryUpsertedCount = categoryResult.upsertedCount || 0;

    const categoryIdBySlug = await getCategoryIdMap(ProductCategoryModel);
    const records = buildProductRecords(categoryIdBySlug);
    validateProductRecords(records, ProductModel);

    const productResult = await ProductModel.bulkWrite(
      buildProductOperations(records),
      { ordered: false }
    );
    summary.productUpsertedCount = productResult.upsertedCount || 0;
    summary.productModifiedCount = productResult.modifiedCount || 0;

    const seedKeys = PRODUCT_SEED_DATA.map((entry) => entry.seedKey);
    const [seededProducts, allManagedProducts, currentDiseases] = await Promise.all([
      ProductModel.find({ seedKey: { $in: seedKeys } })
        .select('+seedKey')
        .lean(),
      ProductModel.find({ seedKey: { $exists: true } })
        .select('_id')
        .lean(),
      PlantDiseaseModel.find()
        .select('_id diseaseKey recommendedProducts')
        .lean(),
    ]);

    const recommendationOperations = buildDiseaseRecommendationOperations({
      diseases: currentDiseases,
      seededProducts,
      allManagedProductIds: allManagedProducts.map((product) => product._id),
    });
    const diseaseResult = await PlantDiseaseModel.bulkWrite(
      recommendationOperations,
      { ordered: false }
    );
    summary.diseaseModifiedCount = diseaseResult.modifiedCount || 0;
  }

  logger.log(
    `[Seed Product] ${dryRun ? 'Dry run' : 'Hoàn tất'}: `
    + `${summary.productCount} sản phẩm, `
    + `${summary.productUpsertedCount} thêm mới, `
    + `${summary.productModifiedCount} cập nhật, `
    + `${summary.mappedDiseaseCount} bệnh có khuyến nghị, `
    + `${summary.recommendationCount} mapping.`
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
    await seedProducts({ dryRun });
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runCli().catch(async (error) => {
    console.error(`[Seed Product] Thất bại: ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

module.exports = {
  buildCategoryOperations,
  buildDiseaseRecommendationOperations,
  buildProductOperations,
  buildProductRecords,
  getProductsByDiseaseKey,
  getSeedCoverage,
  seedProducts,
  uniqueIds,
  validateProductRecords,
  validateProductSeedData,
};
