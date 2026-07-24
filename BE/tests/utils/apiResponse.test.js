const { success, created, error, notFound } = require('../../src/utils/apiResponse');

function responseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('apiResponse', () => {
  test.each([
    ['success', success, ['OK', { id: 1 }], 200, true],
    ['created', created, ['Created', { id: 1 }], 201, true],
    ['error', error, ['Invalid', 400], 400, false],
    ['notFound', notFound, ['Missing'], 404, false],
  ])('%s trả về đúng mã và trạng thái', (_name, handler, args, statusCode, isSuccess) => {
    const res = responseMock();
    handler(res, ...args);
    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: isSuccess }));
  });
});
