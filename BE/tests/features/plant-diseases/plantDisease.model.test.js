// plantDisease.model.test.js - Kiểm tra cấu trúc kho tri thức bệnh cây
const PlantDisease = require('../../../src/features/plant-diseases/plantDisease.model');

describe('PlantDisease schema', () => {
  test('cấu hình canonical key duy nhất và timestamps', () => {
    const { schema } = PlantDisease;
    const diseaseKeyPath = schema.path('diseaseKey');
    const diseaseKeyIndex = schema.indexes().find(
      ([fields]) => fields.diseaseKey === 1
    );

    expect(diseaseKeyPath.options.required).toBe(true);
    expect(diseaseKeyPath.options.lowercase).toBe(true);
    expect(diseaseKeyIndex?.[1]).toEqual(expect.objectContaining({
      unique: true,
      partialFilterExpression: {
        diseaseKey: { $type: 'string' },
      },
    }));
    expect(schema.options.timestamps).toBe(true);
  });

  test('cấu hình field kiến thức dạng mảng và Product reference', () => {
    const { schema } = PlantDisease;

    ['aliases', 'symptoms', 'causes', 'treatments', 'preventions'].forEach((field) => {
      expect(schema.path(field).instance).toBe('Array');
    });
    expect(schema.path('recommendedProducts').instance).toBe('Array');
    expect(schema.path('recommendedProducts').embeddedSchemaType.options.ref).toBe('Product');
    expect(schema.path('affectedPlantIds').instance).toBe('Array');
    expect(schema.path('affectedPlantIds').embeddedSchemaType.options.ref).toBe('Plant');
    expect(schema.path('affectedPlantIds').options.default).toEqual([]);
    expect(schema.path('plantId')).toBeUndefined();
    expect(schema.path('isActive').options.default).toBe(true);
  });

  test('chỉ chấp nhận category canonical', () => {
    const categoryPath = PlantDisease.schema.path('category');

    expect(categoryPath.options.enum).toEqual([
      'disease',
      'pest',
      'nutrient',
      'environment',
    ]);
    expect(categoryPath.options.default).toBe('disease');
  });
});
