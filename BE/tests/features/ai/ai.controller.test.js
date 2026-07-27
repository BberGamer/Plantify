jest.mock('../../../src/features/ai/ai.service', () => ({
  generateText: jest.fn(),
}));
jest.mock('../../../src/features/ai/aiDiagnosisOrchestrator.service', () => ({
  orchestrateDiagnosis: jest.fn(),
}));
jest.mock('../../../src/utils/apiResponse');

const orchestrator = require(
  '../../../src/features/ai/aiDiagnosisOrchestrator.service'
);
const apiResponse = require('../../../src/utils/apiResponse');
const controller = require('../../../src/features/ai/ai.controller');

describe('AI diagnosis controller', () => {
  const file = {
    buffer: Buffer.from('image'),
    mimetype: 'image/jpeg',
  };
  const res = {};
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('orchestrates diagnosis for the authenticated customer with optional ids', async () => {
    const req = {
      user: { id: '507f1f77bcf86cd799439011', role: 'customer' },
      file,
      body: {
        userPlantId: '507f1f77bcf86cd799439012',
        catalogPlantId: '507f1f77bcf86cd799439013',
      },
    };
    const result = {
      diagnosis: { diseaseKey: 'leaf-spot' },
      diseaseInfo: null,
      recommendations: { treatments: [], preventions: [] },
      recommendedProducts: [],
      diagnosisHistoryId: '507f1f77bcf86cd799439014',
      createdAt: new Date(),
    };
    orchestrator.orchestrateDiagnosis.mockResolvedValue(result);

    await controller.diagnosePlantDisease(req, res, next);

    expect(orchestrator.orchestrateDiagnosis).toHaveBeenCalledWith({
      userId: req.user.id,
      file,
      userPlantId: req.body.userPlantId,
      catalogPlantId: req.body.catalogPlantId,
    });
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      result
    );
  });

  test('returns 400 when the image is missing', async () => {
    const req = {
      user: { id: '507f1f77bcf86cd799439011' },
      body: {},
    };

    await controller.diagnosePlantDisease(req, res, next);

    expect(apiResponse.error).toHaveBeenCalledWith(
      res,
      expect.any(String),
      400
    );
    expect(orchestrator.orchestrateDiagnosis).not.toHaveBeenCalled();
  });

  test('passes orchestrator errors to the central error handler', async () => {
    const error = new Error('Diagnosis failed');
    const req = {
      user: { id: '507f1f77bcf86cd799439011' },
      file,
      body: {},
    };
    orchestrator.orchestrateDiagnosis.mockRejectedValue(error);

    await controller.diagnosePlantDisease(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
