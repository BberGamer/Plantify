jest.mock('../../../src/features/comments/comment.model', () => ({
  create: jest.fn(),
  aggregate: jest.fn(),
  findById: jest.fn(),
}));
jest.mock('../../../src/features/posts/post.model', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock('../../../src/features/products/product.model', () => ({}));
jest.mock('../../../src/features/notifications/notification.service', () => ({
  createNotification: jest.fn(),
}));

const Comment = require('../../../src/features/comments/comment.model');
const Post = require('../../../src/features/posts/post.model');
const { createNotification } = require('../../../src/features/notifications/notification.service');
const { createComment } = require('../../../src/features/comments/comment.service');

const postId = '507f1f77bcf86cd799439011';
const userId = '507f1f77bcf86cd799439012';
const authorId = '507f1f77bcf86cd799439013';

describe('commentService.createComment', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    ['User ID', { postId, content: 'Hữu ích', rating: 4 }, { id: 'invalid-user' }, 'Nguoi dung chua duoc xac thuc hop le', 401],
    ['Post ID', { postId: 'invalid-post', content: 'Hữu ích', rating: 4 }, { id: userId }, 'Post ID khong hop le', 400],
    ['nội dung', { postId, content: ' ', rating: 4 }, { id: userId }, 'Noi dung binh luan la bat buoc', 400],
    ['rating bằng 0', { postId, content: 'Hữu ích', rating: 0 }, { id: userId }, 'Danh gia phai la so nguyen tu 1 den 5', 400],
    ['rating bằng 6', { postId, content: 'Hữu ích', rating: 6 }, { id: userId }, 'Danh gia phai la so nguyen tu 1 den 5', 400],
    ['rating thập phân', { postId, content: 'Hữu ích', rating: 2.5 }, { id: userId }, 'Danh gia phai la so nguyen tu 1 den 5', 400],
  ])('từ chối %s không hợp lệ', async (_description, payload, currentUser, message, statusCode) => {
    await expect(createComment(payload, currentUser)).rejects.toMatchObject({ message, statusCode });

    expect(Comment.create).not.toHaveBeenCalled();
    expect(Comment.aggregate).not.toHaveBeenCalled();
  });

  test('từ chối khi không tìm thấy bài viết', async () => {
    Post.findById.mockResolvedValue(null);

    await expect(createComment({ postId, content: 'Hữu ích', rating: 4 }, { id: userId }))
      .rejects.toMatchObject({
        message: 'Khong tim thay bai viet',
        statusCode: 404,
      });

    expect(Comment.create).not.toHaveBeenCalled();
  });

  test('tạo bình luận hợp lệ và cập nhật rating tổng hợp của bài viết', async () => {
    const post = { _id: postId, userId: authorId };
    const comment = { _id: '507f1f77bcf86cd799439014', postId, userId, rating: 4 };
    const populatedComment = { ...comment, content: 'Hữu ích' };
    const finalQuery = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(populatedComment),
    };
    Post.findById.mockResolvedValue(post);
    Comment.create.mockResolvedValue(comment);
    Comment.aggregate.mockResolvedValue([{ commentsCount: 3, avgRating: 4.333 }]);
    Post.findByIdAndUpdate.mockResolvedValue(post);
    createNotification.mockResolvedValue(undefined);
    Comment.findById.mockReturnValue(finalQuery);

    const result = await createComment({
      postId,
      content: '  Hữu ích  ',
      rating: 4,
    }, { id: userId });

    expect(Comment.create).toHaveBeenCalledWith({
      userId,
      postId,
      content: 'Hữu ích',
      rating: 4,
    });
    expect(Comment.aggregate).toHaveBeenCalledWith([
      { $match: { postId: expect.any(Object), rating: { $gte: 1, $lte: 5 } } },
      {
        $group: {
          _id: '$postId',
          commentsCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
    expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(postId, {
      commentsCount: 3,
      avgRating: 4.3,
    });
    expect(createNotification).toHaveBeenCalledWith({
      recipientId: authorId,
      actorId: userId,
      type: 'post_commented',
      postId,
      commentId: comment._id,
    });
    expect(result).toBe(populatedComment);
  });
});
