const router = require('../../../src/features/ai/ai.routes');

describe('AI routes', () => {
  test('only exposes the protected diagnosis route in the required order', () => {
    const chatRoute = router.stack.find((layer) => layer.route?.path === '/chat');
    const diagnosisRoute = router.stack.find(
      (layer) => layer.route?.path === '/diagnose'
    );

    expect(chatRoute).toBeUndefined();
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
