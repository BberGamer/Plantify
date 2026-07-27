jest.mock('../../../src/features/diagnosis-history/diagnosisHistory.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});

const DiagnosisHistory = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.model'
);
const service = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.service'
);

const userId = '507f1f77bcf86cd799439011';
const historyId = '507f1f77bcf86cd799439012';
const userPlantId = '507f1f77bcf86cd799439013';
const diseaseId = '507f1f77bcf86cd799439014';
const productId = '507f1f77bcf86cd799439015';

function createQuery() {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([]),
  };
}

describe('diagnosisHistoryService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates an owned history and ignores a supplied userId', async () => {
    DiagnosisHistory.mockImplementation((data) => ({
      save: jest.fn().mockResolvedValue(data),
    }));

    const result = await service.createDiagnosisHistory(userId, {
      userId: '507f1f77bcf86cd799439099',
      userPlantId,
      image: {
        storageKey: 'diagnoses/a.jpg',
        url: 'https://example.com/a.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 100,
      },
      diagnosis: {
        diseaseId,
        diseaseKey: '  LEAF-SPOT ',
        confidence: 0.9,
        matchStatus: 'matched',
      },
      ai: { provider: 'openrouter', model: 'example' },
      recommendationSnapshot: { productIds: [productId] },
      ignored: true,
    });

    expect(result.userId).toBe(userId);
    expect(result.diagnosis.diseaseKey).toBe('leaf-spot');
    expect(result).not.toHaveProperty('ignored');
  });

  test('filters only the current user, paginates and caps limit at 100', async () => {
    DiagnosisHistory.countDocuments.mockResolvedValue(205);
    const query = createQuery();
    DiagnosisHistory.find.mockReturnValue(query);

    const result = await service.getMyDiagnosisHistories(userId, {
      userPlantId,
      diseaseKey: '  LEAF-SPOT ',
      page: '2',
      limit: '1000',
    });

    expect(DiagnosisHistory.countDocuments).toHaveBeenCalledWith({
      userId,
      userPlantId,
      'diagnosis.diseaseKey': 'leaf-spot',
    });
    expect(DiagnosisHistory.find).toHaveBeenCalledWith({
      userId,
      userPlantId,
      'diagnosis.diseaseKey': 'leaf-spot',
    });
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(query.skip).toHaveBeenCalledWith(100);
    expect(query.limit).toHaveBeenCalledWith(100);
    expect(result).toEqual(expect.objectContaining({
      total: 205,
      pages: 3,
      currentPage: 2,
    }));
  });

  test('loads detail using both history and owner ids', async () => {
    const query = createQuery();
    DiagnosisHistory.findOne.mockReturnValue(query);

    await service.getMyDiagnosisHistoryById(userId, historyId);

    expect(DiagnosisHistory.findOne).toHaveBeenCalledWith({
      _id: historyId,
      userId,
    });
    expect(query.populate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ path: 'diagnosis.diseaseId' }),
      expect.objectContaining({ path: 'catalogPlantId' }),
      expect.objectContaining({ path: 'recommendationSnapshot.productIds' }),
    ]));
  });

  test('rejects invalid ids and pagination', async () => {
    await expect(
      service.getMyDiagnosisHistoryById(userId, 'invalid')
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getMyDiagnosisHistories(userId, { userPlantId: 'invalid' })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getMyDiagnosisHistories(userId, { page: 0 })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.createDiagnosisHistory(userId, {
        recommendationSnapshot: { productIds: ['invalid'] },
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
