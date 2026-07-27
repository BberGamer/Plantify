// userPlant.routes.test.js - Kiểm tra route CRUD và lớp authenticate chung
const router = require('../../../src/features/my-garden/userPlant.routes');

describe('My Garden routes', () => {
  test('bảo vệ toàn bộ router bằng authenticate', () => {
    expect(router.stack[0].handle.name).toBe('authenticate');
  });

  test('đăng ký đủ năm endpoint CRUD đúng HTTP method', () => {
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: layer.route.methods,
      }));

    expect(routes).toEqual(expect.arrayContaining([
      { path: '/', methods: expect.objectContaining({ post: true }) },
      { path: '/', methods: expect.objectContaining({ get: true }) },
      { path: '/:id', methods: expect.objectContaining({ get: true }) },
      { path: '/:id', methods: expect.objectContaining({ patch: true }) },
      { path: '/:id', methods: expect.objectContaining({ delete: true }) },
    ]));
  });
});
