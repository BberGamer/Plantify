jest.mock('axios', () => ({
  post: jest.fn(),
}));

const axios = require('axios');
const {
  OpenRouterDiagnosisProvider,
} = require('../../../../src/lib/ai/providers/openrouter.diagnosis.provider');
const {
  normalizeAIResponse,
} = require('../../../../src/features/ai/aiDiagnosisOrchestrator.service');

function mockOpenRouterResponse(result) {
  axios.post.mockResolvedValue({
    data: {
      choices: [{
        message: {
          content: JSON.stringify({
            ...result,
            treatment: ['Field ngoài contract'],
            solutionProposal: { steps: ['Field ngoài contract'] },
            unexpected: true,
          }),
        },
      }],
    },
  });
}

describe('OpenRouterDiagnosisProvider contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test.each([
    [
      'disease',
      {
        diseaseKey: 'Bệnh Đốm Lá',
        label: 'Bệnh đốm lá',
        category: 'Disease',
        confidence: 82,
        severity: 'High',
        affectedPart: 'Whole Plant',
        description: '  Đốm nâu xuất hiện trên cây. ',
      },
      {
        diseaseKey: 'benh-dom-la',
        category: 'disease',
        confidence: 0.82,
        severity: 'high',
        affectedPart: 'whole_plant',
      },
    ],
    [
      'healthy',
      {
        diseaseKey: 'not-trusted-for-healthy',
        label: 'Cây khỏe mạnh',
        category: 'Healthy',
        confidence: 0.96,
        severity: 'Low',
        affectedPart: 'Leaf',
        description: 'Không thấy dấu hiệu bất thường.',
      },
      {
        diseaseKey: 'healthy',
        category: 'healthy',
        confidence: 0.96,
        severity: 'low',
        affectedPart: 'leaf',
      },
    ],
    [
      'unknown',
      {
        diseaseKey: 'some-guessed-disease',
        label: 'Không đủ dữ liệu',
        category: 'Unknown',
        confidence: -10,
        severity: 'Invalid',
        affectedPart: 'Invalid',
        description: 'Ảnh quá mờ.',
      },
      {
        diseaseKey: 'unknown',
        category: 'unknown',
        confidence: 0,
        severity: 'unknown',
        affectedPart: 'unknown',
      },
    ],
  ])('returns a normalized %s response compatible with the orchestrator', async (
    name,
    rawResult,
    expected
  ) => {
    mockOpenRouterResponse(rawResult);
    const provider = new OpenRouterDiagnosisProvider();

    const result = await provider.diagnoseFromImage(
      Buffer.from('image'),
      'generated.jpg',
      'image/jpeg'
    );
    const orchestratorResult = normalizeAIResponse(result);

    expect(result).toEqual({
      diseaseKey: expect.any(String),
      label: expect.any(String),
      category: expect.any(String),
      confidence: expect.any(Number),
      severity: expect.any(String),
      affectedPart: expect.any(String),
      description: expect.any(String),
      model: provider.modelName,
      provider: 'openrouter',
    });
    expect(result).toEqual(expect.objectContaining(expected));
    expect(orchestratorResult).toEqual(expect.objectContaining({
      ...expected,
      provider: 'openrouter',
      model: provider.modelName,
    }));
    expect(result).not.toHaveProperty('treatment');
    expect(result).not.toHaveProperty('solutionProposal');
    expect(result).not.toHaveProperty('unexpected');
  });

  test('requests exactly the diagnosis contract without recommendation fields', async () => {
    mockOpenRouterResponse({
      diseaseKey: 'healthy',
      label: 'Cây khỏe mạnh',
      category: 'Healthy',
      confidence: 0.9,
      severity: 'Low',
      affectedPart: 'Leaf',
      description: '',
    });
    const provider = new OpenRouterDiagnosisProvider();

    await provider.diagnoseFromImage(
      Buffer.from('image'),
      'generated.jpg',
      'image/jpeg'
    );

    const prompt = axios.post.mock.calls[0][1].messages[0].content[0].text;
    expect(prompt).toContain('"diseaseKey"');
    expect(prompt).toContain('Healthy | Unknown');
    expect(prompt).toContain('Whole_Plant');
    expect(prompt).not.toContain('"treatment"');
    expect(prompt).not.toContain('"solutionProposal"');
  });
});
