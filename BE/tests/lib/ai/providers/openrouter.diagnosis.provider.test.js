jest.mock('axios', () => ({ post: jest.fn() }));

const axios = require('axios');
const {
  OpenRouterDiagnosisProvider,
} = require('../../../../src/lib/ai/providers/openrouter.diagnosis.provider');
const {
  normalizeAIResponse,
} = require('../../../../src/features/ai/aiDiagnosisOrchestrator.service');

function mockResponse(result) {
  axios.post.mockResolvedValue({
    data: {
      choices: [{
        message: {
          content: JSON.stringify({
            ...result,
            diseaseKey: 'must-be-dropped',
            treatment: ['must-be-dropped'],
            unexpected: true,
          }),
        },
      }],
    },
  });
}

describe('OpenRouter diagnosis contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test.each([
    ['disease', {
      suspectedCondition: ' Đốm nâu lá ',
      category: 'Disease',
      observedSymptoms: [' Đốm nâu trên lá ', 123, ''],
      confidence: 85,
      severity: 'High',
      affectedPart: 'Leaf',
      description: ' Có nhiều đốm. ',
    }, {
      suspectedCondition: 'Đốm nâu lá',
      category: 'disease',
      observedSymptoms: ['Đốm nâu trên lá'],
      confidence: 0.85,
      severity: 'high',
      affectedPart: 'leaf',
      description: 'Có nhiều đốm.',
    }],
    ['healthy', {
      suspectedCondition: 'Cây khỏe mạnh',
      category: 'Healthy',
      observedSymptoms: [],
      confidence: 0.95,
      severity: 'Low',
      affectedPart: 'Whole Plant',
      description: '',
    }, {
      suspectedCondition: 'Cây khỏe mạnh',
      category: 'healthy',
      observedSymptoms: [],
      confidence: 0.95,
      severity: 'low',
      affectedPart: 'whole_plant',
      description: '',
    }],
    ['unknown', {
      category: 'invalid',
      observedSymptoms: 'invalid',
      confidence: -1,
      severity: 'invalid',
      affectedPart: 'invalid',
    }, {
      suspectedCondition: 'Không đủ dữ liệu',
      category: 'unknown',
      observedSymptoms: [],
      confidence: 0,
      severity: 'unknown',
      affectedPart: 'unknown',
      description: '',
    }],
  ])('normalizes %s output for the orchestrator', async (name, raw, expected) => {
    mockResponse(raw);
    const provider = new OpenRouterDiagnosisProvider();

    const result = await provider.diagnoseFromImage(
      Buffer.from('image'),
      'generated.jpg',
      'image/jpeg'
    );

    expect(result).toEqual({
      ...expected,
      model: provider.modelName,
      provider: 'openrouter',
    });
    expect(normalizeAIResponse(result)).toEqual(expect.objectContaining(expected));
    expect(result).not.toHaveProperty('diseaseKey');
    expect(result).not.toHaveProperty('treatment');
    expect(result).not.toHaveProperty('unexpected');
  });

  test('uses deterministic generation and asks only for observation fields', async () => {
    mockResponse({
      suspectedCondition: 'Cây khỏe mạnh',
      category: 'Healthy',
      observedSymptoms: [],
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

    const payload = axios.post.mock.calls[0][1];
    const prompt = payload.messages[0].content[0].text;
    expect(payload.temperature).toBe(0);
    expect(prompt).toContain('"suspectedCondition"');
    expect(prompt).toContain('"observedSymptoms"');
    expect(prompt).not.toContain('"diseaseKey"');
    expect(prompt).not.toContain('"treatment"');
  });
});
