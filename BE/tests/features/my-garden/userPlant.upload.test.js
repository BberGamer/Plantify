// userPlant.upload.test.js - Kiểm tra validation file upload album My Garden
const { imageFileFilter } = require('../../../src/features/my-garden/userPlant.upload');

describe('UserPlant album upload validation', () => {
  test.each(['image/jpeg', 'image/png', 'image/webp'])('chấp nhận %s', (mimetype) => {
    const callback = jest.fn();
    imageFileFilter({}, { mimetype }, callback);
    expect(callback).toHaveBeenCalledWith(null, true);
  });

  test('từ chối GIF và file không phải ảnh', () => {
    const callback = jest.fn();
    imageFileFilter({}, { mimetype: 'image/gif' }, callback);
    expect(callback.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
  });
});
