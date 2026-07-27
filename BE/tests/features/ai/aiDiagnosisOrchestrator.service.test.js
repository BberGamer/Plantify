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
  findOne: jest.fn(),
}));

const aiService = require('../../../src/features/ai/ai.service');
const imageStorage = require(
  '../../../src/features/ai/diagnosisImageStorage.service'
);
const historyService = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.service'
);
const PlantDisease = require(
  '../../../src/features/plant-diseases/plantDisease.model'
);
const orchestrator = require(
  '../../../src/features/ai/aiDiagnosisOrchestrator.service'
);

const userId = '507f1f77bcf86cd799439011';
const diseaseId = '507f1f77bcf86cd799439012';
const productId = '507f1f77bcf86cd799439013';
const historyId = '507f1f77bcf86cd799439014';
const file = {
  buffer: Buffer.from('image'),
  mimetype: 'image/jpeg',
  originalname: 'unsafe-name.jpg',
};
const image = {
  storageKey: `diagnoses/${userId}/2026/07/generated.jpg`,
  url: `/uploads/diagnoses/${userId}/2026/07/generated.jpg`,
  mimeType: 'image/jpeg',
  sizeBytes: file.buffer.length,
};

function diseaseQuery(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe('aiDiagnosisOrchestratorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    imageStorage.saveDiagnosisImage.mockResolvedValue(image);
    imageStorage.deleteDiagnosisImage.mockResolvedValue(true);
    historyService.createDiagnosisHistory.mockResolvedValue({
      _id: historyId,
      createdAt: new Date('2026-07-27T00:00:00.000Z'),
    });
  });

  test('matches an active disease and uses only knowledge-base recommendations', async () => {
    const product = {
      _id: productId,
      name: 'Thuốc sinh học',
      price: 100000,
      stock: 5,
      isActive: true,
    };
    const inactiveProduct = {
      _id: '507f1f77bcf86cd799439015',
      name: 'Sản phẩm ngừng bán',
      stock: 10,
      isActive: false,
    };
    const outOfStockProduct = {
      _id: '507f1f77bcf86cd799439016',
      name: 'Sản phẩm hết hàng',
      stock: 0,
      isActive: true,
    };
    const disease = {
      _id: diseaseId,
      name: 'Bệnh đốm lá',
      diseaseKey: 'benh-dom-la',
      category: 'disease',
      symptoms: ['Đốm nâu'],
      causes: ['Nấm'],
      treatments: ['Cắt bỏ lá bệnh'],
      preventions: ['Giữ cây thông thoáng'],
      recommendedProducts: [product, inactiveProduct, outOfStockProduct],
      images: [],
    };
    aiService.diagnoseFromImage.mockResolvedValue({
      label: 'Bệnh đốm lá',
      diseaseKey: 'BENH-DOM-LA',
      category: 'Disease',
      confidence: 82,
      severity: 'HIGH',
      affectedPart: 'Leaf',
      description: ' Có đốm trên lá ',
      treatment: ['Đề xuất không đáng tin từ AI'],
      solutionProposal: { steps: ['Không được lưu'] },
      unexpected: 'not persisted',
      model: 'vision-model',
    });
    PlantDisease.findOne.mockReturnValue(diseaseQuery(disease));

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(PlantDisease.findOne).toHaveBeenCalledWith({
      diseaseKey: 'benh-dom-la',
      isActive: true,
    });
    expect(result.diagnosis).toEqual(expect.objectContaining({
      diseaseId,
      diseaseKey: 'benh-dom-la',
      confidence: 0.82,
      severity: 'high',
      affectedPart: 'leaf',
      matchStatus: 'matched',
    }));
    expect(result.recommendations).toEqual({
      treatments: disease.treatments,
      preventions: disease.preventions,
    });
    expect(result.recommendedProducts).toEqual([product]);
    expect(result.diagnosisHistoryId).toBe(historyId);

    const historyPayload = historyService.createDiagnosisHistory.mock.calls[0][1];
    expect(historyPayload.recommendationSnapshot).toEqual({
      treatments: disease.treatments,
      preventions: disease.preventions,
      productIds: [productId],
    });
    expect(historyPayload.ai.rawResponse).not.toHaveProperty('treatment');
    expect(historyPayload.ai.rawResponse).not.toHaveProperty('solutionProposal');
    expect(historyPayload.ai.rawResponse).not.toHaveProperty('unexpected');
  });

  test('does not match or recommend products for low confidence', async () => {
    aiService.diagnoseFromImage.mockResolvedValue({
      label: 'Bệnh đốm lá',
      confidence: 0.49,
      treatment: ['AI treatment'],
      model: 'vision-model',
    });

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(PlantDisease.findOne).not.toHaveBeenCalled();
    expect(result.diagnosis.matchStatus).toBe('low_confidence');
    expect(result.diseaseInfo).toBeNull();
    expect(result.recommendations).toEqual({ treatments: [], preventions: [] });
    expect(result.recommendedProducts).toEqual([]);
  });

  test('does not match an unknown diagnosis', async () => {
    aiService.diagnoseFromImage.mockResolvedValue({
      label: 'Không đủ dữ liệu',
      category: 'Unknown',
      confidence: 0.9,
      model: 'vision-model',
    });

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(PlantDisease.findOne).not.toHaveBeenCalled();
    expect(result.diagnosis.matchStatus).toBe('unknown');
    expect(result.diagnosis.diseaseId).toBeNull();
    expect(result.recommendedProducts).toEqual([]);
  });

  test('does not match a healthy plant', async () => {
    aiService.diagnoseFromImage.mockResolvedValue({
      label: 'Cây khỏe mạnh',
      category: 'Healthy',
      confidence: 0.95,
      model: 'vision-model',
    });

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(PlantDisease.findOne).not.toHaveBeenCalled();
    expect(result.diagnosis.matchStatus).toBe('unknown');
    expect(result.diseaseInfo).toBeNull();
    expect(result.recommendedProducts).toEqual([]);
  });

  test('falls back to an exact case-insensitive name or alias match', async () => {
    const disease = {
      _id: diseaseId,
      name: 'Leaf Spot',
      diseaseKey: 'leaf-spot',
      treatments: [],
      preventions: [],
      recommendedProducts: [],
    };
    aiService.diagnoseFromImage.mockResolvedValue({
      label: 'LEAF SPOT',
      diseaseKey: 'different-key',
      confidence: 0.8,
      model: 'vision-model',
    });
    PlantDisease.findOne
      .mockReturnValueOnce(diseaseQuery(null))
      .mockReturnValueOnce(diseaseQuery(disease));

    const result = await orchestrator.orchestrateDiagnosis({ userId, file });

    expect(PlantDisease.findOne).toHaveBeenCalledTimes(2);
    expect(PlantDisease.findOne.mock.calls[1][0]).toEqual(expect.objectContaining({
      isActive: true,
      $or: expect.any(Array),
    }));
    expect(result.diagnosis.matchStatus).toBe('matched');
    expect(result.diagnosis.diseaseKey).toBe('leaf-spot');
  });

  test.each([
    ['AI failure', () => aiService.diagnoseFromImage.mockRejectedValue(new Error('AI failed'))],
    ['matching failure', () => {
      aiService.diagnoseFromImage.mockResolvedValue({
        label: 'Leaf spot',
        confidence: 0.8,
        model: 'vision-model',
      });
      PlantDisease.findOne.mockImplementation(() => {
        throw new Error('Database failed');
      });
    }],
    ['history failure', () => {
      aiService.diagnoseFromImage.mockResolvedValue({
        label: 'Unknown',
        category: 'Unknown',
        confidence: 0.8,
        model: 'vision-model',
      });
      historyService.createDiagnosisHistory.mockRejectedValue(
        new Error('History failed')
      );
    }],
  ])('rolls back the stored image on %s', async (name, arrangeFailure) => {
    arrangeFailure();

    await expect(
      orchestrator.orchestrateDiagnosis({ userId, file })
    ).rejects.toThrow();
    expect(imageStorage.deleteDiagnosisImage).toHaveBeenCalledWith(
      image.storageKey
    );
  });
});
