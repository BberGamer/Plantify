jest.mock('../../../src/features/ai/ai.service', () => ({
  diagnoseFromImage: jest.fn(),
}));
jest.mock('../../../src/features/ai/diagnosisImageStorage.service', () => ({
  saveDiagnosisImage: jest.fn(),
  deleteDiagnosisImage: jest.fn(),
}));
jest.mock('../../../src/features/diagnosis-history/diagnosisHistory.service', () => ({
  createDiagnosisHistory: jest.fn(),
}));
jest.mock('../../../src/features/plant-diseases/plantDisease.model', () => ({
  find: jest.fn(),
}));

const aiService = require('../../../src/features/ai/ai.service');
const imageStorage = require('../../../src/features/ai/diagnosisImageStorage.service');
const historyService = require('../../../src/features/diagnosis-history/diagnosisHistory.service');
const PlantDisease = require('../../../src/features/plant-diseases/plantDisease.model');
const orchestrator = require('../../../src/features/ai/aiDiagnosisOrchestrator.service');

const userId = '507f1f77bcf86cd799439011';
const diseaseId = '507f1f77bcf86cd799439012';
const productId = '507f1f77bcf86cd799439013';
const historyId = '507f1f77bcf86cd799439014';
const file = { buffer: Buffer.from('image'), mimetype: 'image/jpeg' };
const image = {
  storageKey: `diagnoses/${userId}/2026/07/generated.jpg`,
  url: `/uploads/diagnoses/${userId}/2026/07/generated.jpg`,
  mimeType: 'image/jpeg',
  sizeBytes: file.buffer.length,
};
const product = {
  _id: productId,
  name: 'Thuốc trị nấm',
  thumbnail: '',
  images: ['https://cdn.example.com/products/fungicide.jpg'],
  stock: 4,
  isActive: true,
};
const leafSpot = {
  _id: diseaseId,
  name: 'Đốm lá',
  diseaseKey: 'dom-la',
  category: 'disease',
  aliases: ['Leaf spot', 'Đốm lá do nấm'],
  symptoms: ['Đốm nâu trên lá', 'Lá xuất hiện vùng vàng nâu'],
  treatments: ['Loại bỏ lá bệnh'],
  preventions: ['Giữ tán cây thông thoáng'],
  recommendedProducts: [product],
};

function query(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

function aiResult(overrides = {}) {
  return {
    suspectedCondition: 'Đốm nâu lá',
    category: 'disease',
    observedSymptoms: ['Đốm nâu trên lá'],
    confidence: 0.85,
    severity: 'medium',
    affectedPart: 'leaf',
    description: 'Quan sát thấy đốm trên lá.',
    model: 'vision-model',
    provider: 'openrouter',
    ...overrides,
  };
}

describe('AI diagnosis orchestrator scoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    imageStorage.saveDiagnosisImage.mockResolvedValue(image);
    imageStorage.deleteDiagnosisImage.mockResolvedValue(true);
    historyService.createDiagnosisHistory.mockResolvedValue({
      _id: historyId,
      createdAt: new Date('2026-07-27T00:00:00.000Z'),
    });
  });

  test.each(['Đốm nâu lá', 'Đốm lá vàng'])(
    'maps %s to the canonical leaf-spot disease using symptoms and category',
    async (suspectedCondition) => {
      aiService.diagnoseFromImage.mockResolvedValue(aiResult({
        suspectedCondition,
        observedSymptoms: ['Đốm nâu trên lá', 'Vùng vàng nâu trên lá'],
      }));
      const diseaseQuery = query([leafSpot]);
      PlantDisease.find.mockReturnValue(diseaseQuery);

      const result = await orchestrator.orchestrateDiagnosis({ userId, file });

      expect(PlantDisease.find).toHaveBeenCalledWith({
        isActive: true,
        category: 'disease',
      });
      expect(diseaseQuery.populate).toHaveBeenCalledWith(
        'recommendedProducts',
        'name thumbnail images price stock isActive'
      );
      expect(result.diagnosis).toEqual(expect.objectContaining({
        diseaseId,
        diseaseKey: 'dom-la',
        category: 'disease',
        matchStatus: 'matched',
        observedSymptoms: ['Đốm nâu trên lá', 'Vùng vàng nâu trên lá'],
      }));
      expect(result.diagnosis.matchScore).toBeGreaterThanOrEqual(0.75);
      expect(result.recommendations).toEqual({
        treatments: leafSpot.treatments,
        preventions: leafSpot.preventions,
      });
      expect(result.recommendedProducts).toEqual([product]);
      expect(result.recommendedProducts[0].images).toEqual(product.images);

      const payload = historyService.createDiagnosisHistory.mock.calls[0][1];
      expect(payload.diagnosis.diseaseKey).toBe('dom-la');
      expect(payload.ai.rawResponse).not.toHaveProperty('diseaseKey');
      expect(payload.recommendationSnapshot.productIds).toEqual([productId]);
    }
  );

  test('matches the exact normalized red-spider condition to its canonical pest record', async () => {
    const redSpiderId = '507f1f77bcf86cd799439017';
    const redSpider = {
      _id: redSpiderId,
      name: 'Nhện đỏ',
      diseaseKey: 'nhen-do',
      category: 'pest',
      aliases: [],
      symptoms: ['Lá có chấm vàng li ti'],
      treatments: ['Cách ly cây bị hại'],
      preventions: ['Kiểm tra mặt dưới lá'],
      recommendedProducts: [],
    };
    aiService.diagnoseFromImage.mockResolvedValue(aiResult({
      suspectedCondition: 'Nhện đỏ',
      category: 'pest',
      observedSymptoms: ['Lá có chấm vàng li ti'],
    }));
    PlantDisease.find.mockReturnValue(query([redSpider]));

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(result.diagnosis).toEqual(expect.objectContaining({
      diseaseId: redSpiderId,
      diseaseKey: 'nhen-do',
      category: 'pest',
      matchStatus: 'matched',
    }));
    expect(result.diagnosis.matchScore).toBeGreaterThanOrEqual(0.75);
  });

  test('returns needs_review and no recommendations for close candidates', async () => {
    const second = {
      ...leafSpot,
      _id: '507f1f77bcf86cd799439099',
      diseaseKey: 'dom-la-khac',
      name: 'Đốm nâu lá khác',
    };
    aiService.diagnoseFromImage.mockResolvedValue(aiResult());
    PlantDisease.find.mockReturnValue(query([leafSpot, second]));

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(result.diagnosis.matchStatus).toBe('needs_review');
    expect(result.diagnosis.diseaseKey).toBe('unknown');
    expect(result.diseaseInfo).toBeNull();
    expect(result.recommendations).toEqual({ treatments: [], preventions: [] });
    expect(result.recommendedProducts).toEqual([]);
  });

  test('does not match a candidate from another category', async () => {
    aiService.diagnoseFromImage.mockResolvedValue(aiResult());
    PlantDisease.find.mockReturnValue(query([{
      ...leafSpot,
      category: 'environment',
    }]));

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(result.diagnosis.matchStatus).toBe('unmatched');
    expect(result.diagnosis.diseaseKey).toBe('unknown');
  });

  test('does not query or match when confidence is low', async () => {
    aiService.diagnoseFromImage.mockResolvedValue(aiResult({ confidence: 0.49 }));

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(PlantDisease.find).not.toHaveBeenCalled();
    expect(result.diagnosis.matchStatus).toBe('low_confidence');
    expect(result.diagnosis.diseaseKey).toBe('unknown');
    expect(result.recommendations.treatments).toEqual([]);
  });

  test.each([
    ['healthy', { category: 'healthy', suspectedCondition: 'Cây khỏe mạnh' }],
    ['unknown', { category: 'unknown', suspectedCondition: 'Không đủ dữ liệu' }],
  ])('does not return specialist recommendations for %s', async (name, values) => {
    aiService.diagnoseFromImage.mockResolvedValue(aiResult(values));

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(result.diagnosis.matchStatus).toBe('unknown');
    expect(result.recommendations).toEqual({ treatments: [], preventions: [] });
    expect(result.recommendedProducts).toEqual([]);
  });

  test('rolls back the image when matching fails', async () => {
    aiService.diagnoseFromImage.mockResolvedValue(aiResult());
    PlantDisease.find.mockImplementation(() => {
      throw new Error('Database failed');
    });

    await expect(
      orchestrator.orchestrateDiagnosis({ userId, file })
    ).rejects.toThrow('Database failed');
    expect(imageStorage.deleteDiagnosisImage).toHaveBeenCalledWith(image.storageKey);
  });
});
