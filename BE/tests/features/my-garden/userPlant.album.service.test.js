// userPlant.album.service.test.js - Kiểm tra bảo mật và lưu file cho album My Garden
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

describe('userPlantService album ảnh', () => {
  beforeEach(() => jest.clearAllMocks());

  test('không cho upload ảnh vào cây không thuộc user hiện tại', async () => {
    UserPlant.findOne.mockResolvedValue(null);
    const result = await service.uploadUserPlantImage(userId, userPlantId, {
      buffer: Buffer.from('image'), mimetype: 'image/png',
    });
    expect(result).toBeNull();
    expect(fs.writeFile).not.toHaveBeenCalled();
    expect(UserPlant.findOne).toHaveBeenCalledWith({ _id: userPlantId, userId, status: 'active' });
  });

  test('từ chối file không đúng định dạng trước khi thao tác database', async () => {
    await expect(service.uploadUserPlantImage(userId, userPlantId, {
      buffer: Buffer.from('text'), mimetype: 'text/plain',
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(UserPlant.findOne).not.toHaveBeenCalled();
  });

  test('rollback file khi MongoDB không thể lưu metadata', async () => {
    const userPlant = {
      albumImages: [],
      save: jest.fn().mockRejectedValue(new Error('MongoDB failed')),
    };
    UserPlant.findOne.mockResolvedValue(userPlant);
    fs.mkdir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.unlink.mockResolvedValue();

    await expect(service.uploadUserPlantImage(userId, userPlantId, {
      buffer: Buffer.from('image'), mimetype: 'image/jpeg',
    })).rejects.toThrow('MongoDB failed');
    expect(fs.writeFile).toHaveBeenCalled();
    expect(fs.unlink).toHaveBeenCalled();
  });

  test('không cho storage key đi ra ngoài thư mục uploads My Garden', () => {
    expect(() => service.getSafeStoragePath('../../outside.jpg')).toThrow('Đường dẫn file không hợp lệ');
    expect(service.getSafeStoragePath('my-garden/user/plant/photo.jpg')).toContain('uploads');
  });

  test('đặt ảnh album làm cover cho đúng cây của user', async () => {
    const image = { _id: imageId, url: '/uploads/my-garden/user/plant/cover.jpg' };
    const images = [];
    images.id = jest.fn().mockReturnValue(image);
    const userPlant = {
      albumImages: images,
      coverImageUrl: '',
      save: jest.fn().mockResolvedValue(),
      toObject: jest.fn().mockReturnValue({ _id: userPlantId, coverImageUrl: image.url }),
    };
    UserPlant.findOne.mockResolvedValue(userPlant);

    const result = await service.updateUserPlantImage(userId, userPlantId, imageId, { setAsCover: true });

    expect(userPlant.coverImageUrl).toBe(image.url);
    expect(userPlant.save).toHaveBeenCalled();
    expect(result.coverImageUrl).toBe(image.url);
  });

  test('xóa cover sẽ chuyển sang ảnh album kế tiếp', async () => {
    const currentImage = {
      _id: imageId,
      url: '/uploads/my-garden/user/plant/current.jpg',
      storageKey: 'my-garden/user/plant/current.jpg',
    };
    const nextImage = { url: '/uploads/my-garden/user/plant/next.jpg' };
    const images = [currentImage, nextImage];
    images.id = jest.fn().mockReturnValue(currentImage);
    currentImage.deleteOne = jest.fn(() => images.splice(0, 1));
    const userPlant = {
      albumImages: images,
      coverImageUrl: currentImage.url,
      save: jest.fn().mockResolvedValue(),
      toObject: jest.fn().mockReturnValue({ _id: userPlantId, coverImageUrl: nextImage.url }),
    };
    UserPlant.findOne.mockResolvedValue(userPlant);
    fs.unlink.mockResolvedValue();

    const result = await service.deleteUserPlantImage(userId, userPlantId, imageId);

    expect(userPlant.coverImageUrl).toBe(nextImage.url);
    expect(fs.unlink).toHaveBeenCalled();
    expect(result.coverImageUrl).toBe(nextImage.url);
  });
});
