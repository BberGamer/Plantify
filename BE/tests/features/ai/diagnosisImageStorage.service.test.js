jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

const fs = require('fs/promises');
const crypto = require('crypto');
const path = require('path');
const service = require(
  '../../../src/features/ai/diagnosisImageStorage.service'
);

const userId = '507f1f77bcf86cd799439011';

describe('diagnosisImageStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.mkdir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.unlink.mockResolvedValue();
    crypto.randomUUID.mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
  });

  test.each([
    ['image/jpeg', 'jpg', 'image/jpeg'],
    ['image/png', 'png', 'image/png'],
    ['image/webp', 'webp', 'image/webp'],
  ])('stores %s Multer buffers using a generated filename', async (
    inputMimeType,
    extension,
    outputMimeType
  ) => {
    const buffer = Buffer.from('image bytes');
    const result = await service.saveDiagnosisImage(userId, {
      buffer,
      mimetype: inputMimeType,
      originalname: '../../user-controlled.exe',
      size: 999999,
    });

    expect(result.storageKey).toMatch(new RegExp(
      `^diagnoses/${userId}/\\d{4}/\\d{2}/123e4567-e89b-12d3-a456-426614174000\\.${extension}$`
    ));
    expect(result).toEqual({
      storageKey: result.storageKey,
      url: `/uploads/${result.storageKey}`,
      mimeType: outputMimeType,
      sizeBytes: buffer.length,
    });
    expect(result.storageKey).not.toContain('user-controlled');
    expect(fs.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('uploads', 'diagnoses', userId)),
      buffer,
      { flag: 'wx' }
    );
  });

  test('rejects unsupported types, missing or empty buffers and invalid user ids', async () => {
    await expect(service.saveDiagnosisImage(userId, {
      mimetype: 'image/gif',
      buffer: Buffer.from('gif'),
    })).rejects.toMatchObject({ statusCode: 400 });

    await expect(service.saveDiagnosisImage(userId, {
      mimetype: 'image/png',
    })).rejects.toMatchObject({ statusCode: 400 });

    await expect(service.saveDiagnosisImage(userId, {
      mimetype: 'image/png',
      buffer: Buffer.alloc(0),
    })).rejects.toMatchObject({ statusCode: 400 });

    await expect(service.saveDiagnosisImage('../outside', {
      mimetype: 'image/png',
      buffer: Buffer.from('png'),
    })).rejects.toMatchObject({ statusCode: 400 });

    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  test('deletes an image using its storage key', async () => {
    const storageKey = `diagnoses/${userId}/2026/07/image.jpg`;

    await expect(service.deleteDiagnosisImage(storageKey)).resolves.toBe(true);

    expect(fs.unlink).toHaveBeenCalledWith(
      expect.stringContaining(path.join('uploads', 'diagnoses', userId))
    );
  });

  test.each([
    '../outside.jpg',
    'diagnoses/../../outside.jpg',
    '..\\outside.jpg',
    '/absolute/outside.jpg',
    'C:\\outside.jpg',
    'products/image.jpg',
    'diagnoses',
    '',
  ])('rejects unsafe storage key %j', async (storageKey) => {
    await expect(
      service.deleteDiagnosisImage(storageKey)
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(fs.unlink).not.toHaveBeenCalled();
  });

  test('is idempotent when the rollback target no longer exists', async () => {
    fs.unlink.mockRejectedValue(Object.assign(new Error('missing'), { code: 'ENOENT' }));

    await expect(
      service.deleteDiagnosisImage(`diagnoses/${userId}/2026/07/missing.jpg`)
    ).resolves.toBe(false);
  });
});
