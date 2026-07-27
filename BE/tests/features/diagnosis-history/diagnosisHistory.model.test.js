const DiagnosisHistory = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.model'
);

describe('DiagnosisHistory schema', () => {
  test('uses the requested collection, timestamps and indexes', () => {
    const { schema } = DiagnosisHistory;
    const indexes = schema.indexes().map(([fields]) => fields);

    expect(schema.options.collection).toBe('diagnosis_histories');
    expect(schema.options.timestamps).toBe(true);
    expect(indexes).toEqual(expect.arrayContaining([
      { userId: 1, createdAt: -1 },
      { userPlantId: 1, createdAt: -1 },
      { 'diagnosis.diseaseKey': 1, createdAt: -1 },
    ]));
  });

  test('configures ownership, references and diagnosis constraints', () => {
    const { schema } = DiagnosisHistory;

    expect(schema.path('userId').options).toEqual(expect.objectContaining({
      required: true,
      ref: 'User',
    }));
    expect(schema.path('userPlantId').options.ref).toBe('UserPlant');
    expect(schema.path('catalogPlantId').options.ref).toBe('Plant');
    expect(schema.path('diagnosis.diseaseId').options.ref).toBe('PlantDisease');
    expect(schema.path('diagnosis.diseaseKey').options.lowercase).toBe(true);
    expect(schema.path('diagnosis.category').options.enum).toEqual([
      'disease',
      'pest',
      'nutrient',
      'environment',
      'healthy',
      'unknown',
    ]);
    expect(schema.path('diagnosis.confidence').options).toEqual(
      expect.objectContaining({ required: true, min: 0, max: 1 })
    );
    expect(schema.path('diagnosis.observedSymptoms').instance).toBe('Array');
    expect(schema.path('diagnosis.matchScore').options).toEqual(
      expect.objectContaining({ min: 0, max: 1, default: 0 })
    );
    expect(schema.path('diagnosis.matchStatus').options.enum).toContain(
      'needs_review'
    );
    expect(
      schema.path('recommendationSnapshot.productIds').embeddedSchemaType.options.ref
    ).toBe('Product');
  });
});
