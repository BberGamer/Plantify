const router = require('../../../src/features/ai/ai.routes');

describe('AI routes', () => {
  test('keeps chat unchanged and protects diagnosis in the required order', () => {
    const chatRoute = router.stack.find((layer) => layer.route?.path === '/chat');
    const diagnosisRoute = router.stack.find(
      (layer) => layer.route?.path === '/diagnose'
    );

    expect(chatRoute.route.methods).toEqual(expect.objectContaining({ post: true }));
    expect(chatRoute.route.stack.map((layer) => layer.handle.name)).toEqual([
      'generateText',
    ]);
    expect(diagnosisRoute.route.methods).toEqual(
      expect.objectContaining({ post: true })
    );
    expect(diagnosisRoute.route.stack.map((layer) => layer.handle.name)).toEqual([
      'authenticate',
      'authorizeCustomer',
      'uploadDiagnosisImage',
      'diagnosePlantDisease',
    ]);
  });
});
