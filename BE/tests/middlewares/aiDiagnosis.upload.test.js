const multer = require('multer');
const {
  imageFileFilter,
  normalizeUploadError,
} = require('../../src/middlewares/aiDiagnosis.upload');

describe('AI diagnosis upload middleware', () => {
  test.each(['image/jpeg', 'image/png', 'image/webp'])(
    'accepts supported MIME type %s',
    (mimetype) => {
      const callback = jest.fn();
      imageFileFilter({}, { mimetype }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    }
  );

  test.each(['image/gif', 'application/pdf', undefined])(
    'rejects unsupported MIME type %s with 400',
    (mimetype) => {
      const callback = jest.fn();
      imageFileFilter({}, { mimetype }, callback);

      const error = callback.mock.calls[0][0];
      expect(error).toEqual(expect.any(Error));
      expect(error.statusCode).toBe(400);
    }
  );

  test('normalizes files over 5MB to 413', () => {
    const error = new multer.MulterError('LIMIT_FILE_SIZE', 'file');

    expect(normalizeUploadError(error)).toEqual(expect.objectContaining({
      statusCode: 413,
      message: expect.stringContaining('5MB'),
    }));
  });

  test('normalizes other Multer errors to 400', () => {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file');
    expect(normalizeUploadError(error).statusCode).toBe(400);
  });
});
