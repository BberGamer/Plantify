// notification.service.test.js - Kiểm tra vòng đời SSE và fallback khi Change Stream không khả dụng
const { EventEmitter } = require('events');

jest.mock('../../../src/features/notifications/notification.model', () => ({
  Notification: {
    watch: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  },
}));

const recipientId = '507f1f77bcf86cd799439011';
const actorId = '507f1f77bcf86cd799439012';

function createRequest() {
  const request = new EventEmitter();
  request.user = { id: recipientId };
  return request;
}

function createResponse() {
  const response = new EventEmitter();
  response.destroyed = false;
  response.writableEnded = false;
  response.status = jest.fn().mockReturnValue(response);
  response.set = jest.fn().mockReturnValue(response);
  response.flushHeaders = jest.fn();
  response.write = jest.fn().mockReturnValue(true);
  response.end = jest.fn(() => {
    response.writableEnded = true;
  });
  return response;
}

function createChangeStream() {
  const stream = new EventEmitter();
  stream.close = jest.fn().mockResolvedValue(undefined);
  return stream;
}

function mockPopulatedNotification(Notification, notification) {
  Notification.findById.mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(notification),
  });
}

function loadService() {
  jest.resetModules();
  const { Notification } = require(
    '../../../src/features/notifications/notification.model'
  );
  const service = require(
    '../../../src/features/notifications/notification.service'
  );
  return { Notification, service };
}

describe('notification realtime service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('vẫn mở SSE khi Notification.watch ném lỗi do MongoDB standalone', () => {
    const { Notification, service } = loadService();
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    Notification.watch.mockImplementation(() => {
      const error = new Error(
        'The $changeStream stage is only supported on replica sets'
      );
      error.code = 40573;
      throw error;
    });
    const request = createRequest();
    const response = createResponse();

    expect(() => service.subscribeNotificationEvents(request, response))
      .not.toThrow();
    expect(response.write).toHaveBeenCalledWith(
      'event: connected\ndata: {}\n\n'
    );
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('SSE vẫn hoạt động'),
      expect.any(String)
    );

    request.emit('close');
  });

  test('Change Stream lỗi không đóng SSE và publish nội bộ vẫn hoạt động', async () => {
    const { Notification, service } = loadService();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    const stream = createChangeStream();
    Notification.watch.mockReturnValue(stream);
    const notification = {
      _id: '507f1f77bcf86cd799439013',
      recipientId,
      actorId,
      type: 'post_commented',
    };
    Notification.create.mockResolvedValue({ _id: notification._id });
    mockPopulatedNotification(Notification, notification);
    const request = createRequest();
    const response = createResponse();
    service.subscribeNotificationEvents(request, response);

    const changeStreamError = new Error(
      'The $changeStream stage is only supported on replica sets'
    );
    changeStreamError.code = 40573;
    expect(() => stream.emit('error', changeStreamError)).not.toThrow();

    await service.createNotification({
      recipientId,
      actorId,
      type: 'post_commented',
    });

    expect(response.write).toHaveBeenCalledWith(
      expect.stringContaining('event: notification.created')
    );
    expect(response.writableEnded).toBe(false);

    await service.shutdownNotificationRealtime();
    expect(response.end).toHaveBeenCalledTimes(1);
    expect(stream.close).toHaveBeenCalled();
  });

  test('client disconnect được dọn một lần và không nhận event tiếp theo', async () => {
    const { Notification, service } = loadService();
    const stream = createChangeStream();
    Notification.watch.mockReturnValue(stream);
    const notification = {
      _id: '507f1f77bcf86cd799439014',
      recipientId,
      actorId,
      type: 'post_commented',
    };
    Notification.create.mockResolvedValue({ _id: notification._id });
    mockPopulatedNotification(Notification, notification);
    const request = createRequest();
    const response = createResponse();
    service.subscribeNotificationEvents(request, response);
    const writesBeforeDisconnect = response.write.mock.calls.length;

    request.emit('close');
    request.emit('close');
    await Promise.resolve();
    await service.createNotification({
      recipientId,
      actorId,
      type: 'post_commented',
    });

    expect(response.write).toHaveBeenCalledTimes(writesBeforeDisconnect);
    expect(stream.close).toHaveBeenCalledTimes(1);
  });
});
