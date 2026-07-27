// userPlant.album.service.test.js - Kiểm tra bảo mật, rollback và cover của album My Garden
jest.mock('fs/promises', () => ({ mkdir: jest.fn(), writeFile: jest.fn(), unlink: jest.fn() }));
jest.mock('../../../src/features/my-garden/userPlant.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});

const fs = require('fs/promises');
const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const service = require('../../../src/features/my-garden/userPlant.service');
const userId = '507f1f77bcf86cd799439011';
const userPlantId = '507f1f77bcf86cd799439012';
const imageId = '507f1f77bcf86cd799439013';
const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

describe('userPlantService album', () => {
  beforeEach(() => jest.clearAllMocks());

  test('does not upload to a plant outside current user ownership', async () => {
    UserPlant.findOne.mockResolvedValue(null);
    const result = await service.uploadUserPlantImage(userId, userPlantId, { buffer: validPng, mimetype: 'image/png' });
    expect(result).toBeNull();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  test('rejects spoofed MIME and invalid metadata before writing a file', async () => {
    await expect(service.uploadUserPlantImage(userId, userPlantId, { buffer: Buffer.from('not image'), mimetype: 'image/png' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.uploadUserPlantImage(userId, userPlantId, { buffer: validPng, mimetype: 'image/png' }, { caption: 123 })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.uploadUserPlantImage(userId, userPlantId, { buffer: validPng, mimetype: 'image/png' }, { capturedAt: 'invalid date' })).rejects.toMatchObject({ statusCode: 400 });
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  test('rolls back the file when metadata save fails', async () => {
    UserPlant.findOne.mockResolvedValue({ albumImages: [], coverImageUrl: '', save: jest.fn().mockRejectedValue(new Error('MongoDB failed')) });
    fs.mkdir.mockResolvedValue(); fs.writeFile.mockResolvedValue(); fs.unlink.mockResolvedValue();
    await expect(service.uploadUserPlantImage(userId, userPlantId, { buffer: validJpeg, mimetype: 'image/jpeg' })).rejects.toThrow('MongoDB failed');
    expect(fs.unlink).toHaveBeenCalled();
  });

  test('sets first uploaded image as cover when no cover exists', async () => {
    const userPlant = { albumImages: [], coverImageUrl: '', save: jest.fn().mockResolvedValue(), toObject: jest.fn(function toObject() { return { coverImageUrl: this.coverImageUrl }; }) };
    UserPlant.findOne.mockResolvedValue(userPlant);
    fs.mkdir.mockResolvedValue(); fs.writeFile.mockResolvedValue();
    await service.uploadUserPlantImage(userId, userPlantId, { buffer: validPng, mimetype: 'image/png' });
    expect(userPlant.coverImageUrl).toMatch(/^\/uploads\/my-garden\//);
  });

  test('moves cover to the next image when deleting current cover', async () => {
    const currentImage = { _id: imageId, url: '/uploads/my-garden/user/plant/current.jpg', storageKey: 'my-garden/user/plant/current.jpg' };
    const nextImage = { url: '/uploads/my-garden/user/plant/next.jpg' };
    const images = [currentImage, nextImage]; images.id = jest.fn().mockReturnValue(currentImage);
    currentImage.deleteOne = jest.fn(() => images.splice(0, 1));
    const userPlant = { albumImages: images, coverImageUrl: currentImage.url, save: jest.fn().mockResolvedValue(), toObject: jest.fn().mockReturnValue({ coverImageUrl: nextImage.url }) };
    UserPlant.findOne.mockResolvedValue(userPlant); fs.unlink.mockResolvedValue();
    await service.deleteUserPlantImage(userId, userPlantId, imageId);
    expect(userPlant.coverImageUrl).toBe(nextImage.url);
  });

  test('rejects traversal outside My Garden uploads root', () => {
    expect(() => service.getSafeStoragePath('../../outside.jpg')).toThrow();
  });
});
