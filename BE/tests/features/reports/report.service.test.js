jest.mock('../../../src/features/reports/report.model', () => ({
  REPORT_REASONS: ['spam', 'sensitive', 'copyright', 'inappropriate', 'harassment', 'misinformation', 'other'],
  REPORT_ACTIONS: ['approve', 'reject', 'remove'],
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../../src/features/posts/post.model', () => ({ findById: jest.fn() }));
jest.mock('../../../src/features/notifications/notification.service', () => ({
  createNotification: jest.fn(),
}));

const Report = require('../../../src/features/reports/report.model');
const Post = require('../../../src/features/posts/post.model');
const { createNotification } = require('../../../src/features/notifications/notification.service');
const { createReport, processReport } = require('../../../src/features/reports/report.service');

const postId = '507f1f77bcf86cd799439011';
const userId = '507f1f77bcf86cd799439012';
const authorId = '507f1f77bcf86cd799439013';

function queryResult(result) {
  return {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe('reportService.createReport', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    ['Post ID', 'invalid-post', userId, 'spam', 'Post ID khong hop le'],
    ['User ID', postId, 'invalid-user', 'spam', 'User ID khong hop le'],
    ['lý do', postId, userId, 'invalid-reason', 'Ly do bao cao khong hop le'],
  ])('từ chối %s không hợp lệ', async (_description, targetPostId, targetUserId, reason, message) => {
    await expect(createReport(targetPostId, targetUserId, reason)).rejects.toMatchObject({
      message,
      statusCode: 400,
    });

    expect(Report.create).not.toHaveBeenCalled();
  });

  test('từ chối khi không tìm thấy bài viết', async () => {
    Post.findById.mockReturnValue(queryResult(null));

    await expect(createReport(postId, userId, 'spam')).rejects.toMatchObject({
      message: 'Khong tim thay bai viet',
      statusCode: 404,
    });

    expect(Report.findOne).not.toHaveBeenCalled();
    expect(Report.create).not.toHaveBeenCalled();
  });

  test('cấm người dùng tự báo cáo bài viết của mình', async () => {
    Post.findById.mockReturnValue(queryResult({ _id: postId, userId }));

    await expect(createReport(postId, userId, 'spam')).rejects.toMatchObject({
      message: 'Ban khong the bao cao bai viet cua chinh minh',
      statusCode: 403,
    });

    expect(Report.findOne).not.toHaveBeenCalled();
    expect(Report.create).not.toHaveBeenCalled();
  });

  test('cấm người dùng báo cáo trùng cùng một bài viết', async () => {
    Post.findById.mockReturnValue(queryResult({ _id: postId, userId: authorId }));
    Report.findOne.mockReturnValue(queryResult({ _id: '507f1f77bcf86cd799439014' }));

    await expect(createReport(postId, userId, 'spam')).rejects.toMatchObject({
      message: 'Ban da bao cao bai viet nay',
      statusCode: 409,
    });

    expect(Report.findOne).toHaveBeenCalledWith({ postId, userId });
    expect(Report.create).not.toHaveBeenCalled();
  });

  test('tạo báo cáo hợp lệ và thông báo cho tác giả bài viết', async () => {
    const post = { _id: postId, userId: authorId };
    const report = { _id: '507f1f77bcf86cd799439014', postId, userId, reason: 'spam' };
    Post.findById.mockReturnValue(queryResult(post));
    Report.findOne.mockReturnValue(queryResult(null));
    Report.create.mockResolvedValue(report);
    createNotification.mockResolvedValue(undefined);

    const result = await createReport(postId, userId, 'spam');

    expect(Report.create).toHaveBeenCalledWith({ postId, userId, reason: 'spam' });
    expect(createNotification).toHaveBeenCalledWith({
      recipientId: authorId,
      actorId: userId,
      type: 'post_reported_under_review',
      postId,
      reportId: report._id,
    });
    expect(result).toBe(report);
  });
});

describe('reportService.processReport', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    ['Report ID', 'invalid-report', userId, 'approve', 'Report ID khong hop le'],
    ['Manager ID', '507f1f77bcf86cd799439014', 'invalid-manager', 'approve', 'Manager ID khong hop le'],
    ['action', '507f1f77bcf86cd799439014', userId, 'invalid-action', 'Hanh dong xu ly bao cao khong hop le'],
  ])('từ chối %s không hợp lệ', async (_description, reportId, managerId, action, message) => {
    await expect(processReport(reportId, managerId, action)).rejects.toMatchObject({
      message,
      statusCode: 400,
    });

    expect(Report.findById).not.toHaveBeenCalled();
  });

  test('từ chối khi không tìm thấy báo cáo', async () => {
    Report.findById.mockResolvedValue(null);

    await expect(processReport(
      '507f1f77bcf86cd799439014',
      userId,
      'approve',
    )).rejects.toMatchObject({
      message: 'Khong tim thay bao cao',
      statusCode: 404,
    });

    expect(Post.findById).not.toHaveBeenCalled();
  });

  test('từ chối khi không tìm thấy bài viết của báo cáo', async () => {
    const report = {
      _id: '507f1f77bcf86cd799439014',
      postId,
      save: jest.fn(),
    };
    Report.findById.mockResolvedValue(report);
    Post.findById.mockResolvedValue(null);

    await expect(processReport(report._id, userId, 'approve')).rejects.toMatchObject({
      message: 'Khong tim thay bai viet',
      statusCode: 404,
    });

    expect(report.save).not.toHaveBeenCalled();
  });

  test.each([
    ['approve', { status: 'approved', isApproved: true, deletedAt: null, processedAt: null }],
    ['reject', { status: 'rejected', isApproved: false }],
    ['remove', { status: 'resolved', isApproved: false }],
  ])('cập nhật đúng report và bài viết khi action là %s', async (action, expectedPost) => {
    const reportId = '507f1f77bcf86cd799439014';
    const report = {
      _id: reportId,
      postId,
      status: 'pending',
      action: null,
      processedBy: null,
      processedAt: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const post = {
      _id: postId,
      status: 'pending',
      isApproved: false,
      deletedAt: null,
      processedAt: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const populatedReport = { _id: reportId, status: 'resolved', action };
    const finalQuery = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(populatedReport),
    };
    Report.findById.mockReturnValueOnce(report).mockReturnValueOnce(finalQuery);
    Post.findById.mockResolvedValue(post);

    const result = await processReport(reportId, userId, action);

    expect(post).toMatchObject(expectedPost);
    if (action === 'remove') {
      expect(post.deletedAt).toBeInstanceOf(Date);
      expect(post.processedAt).toBeInstanceOf(Date);
    }
    expect(report).toMatchObject({
      status: 'resolved',
      action,
      processedBy: userId,
    });
    expect(report.processedAt).toBeInstanceOf(Date);
    expect(post.save).toHaveBeenCalledTimes(1);
    expect(report.save).toHaveBeenCalledTimes(1);
    expect(finalQuery.populate).toHaveBeenCalledTimes(3);
    expect(result).toBe(populatedReport);
  });
});
