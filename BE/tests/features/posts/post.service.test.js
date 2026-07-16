jest.mock('../../../src/features/posts/post.model', () => ({
  create: jest.fn(),
  findById: jest.fn(),
}));
jest.mock('../../../src/features/comments/comment.model', () => ({}));

const Post = require('../../../src/features/posts/post.model');
const { createPost, updatePost } = require('../../../src/features/posts/post.service');

const userId = '507f1f77bcf86cd799439011';

describe('postService.createPost', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    ['tiêu đề', { title: ' ', content: 'Nội dung hợp lệ' }, 'Tiêu đề bài viết là bắt buộc'],
    ['nội dung', { title: 'Cách chăm cây', content: '' }, 'Nội dung bài viết là bắt buộc'],
  ])('từ chối khi thiếu %s', async (_description, payload, message) => {
    await expect(createPost(payload, { id: userId })).rejects.toMatchObject({
      message,
      statusCode: 400,
    });

    expect(Post.create).not.toHaveBeenCalled();
  });

  test('từ chối người dùng không hợp lệ', async () => {
    await expect(createPost({
      title: 'Cách chăm cây',
      content: 'Nội dung hợp lệ',
    }, { id: 'invalid-user' })).rejects.toMatchObject({
      message: 'Người dùng không hợp lệ',
      statusCode: 401,
    });

    expect(Post.create).not.toHaveBeenCalled();
  });

  test('tạo bài viết, gán tác giả và đặt trạng thái chờ duyệt', async () => {
    const createdPost = { _id: '507f1f77bcf86cd799439012', status: 'pending' };
    Post.create.mockResolvedValue(createdPost);

    const result = await createPost({
      title: '  Cách chăm Monstera  ',
      content: '  Tưới cây mỗi tuần  ',
      images: [' monstera-1.jpg ', 'monstera-2.jpg'],
      category: ' Chăm sóc cây ',
      author: 'Tên giả từ client',
      userId: '507f1f77bcf86cd799439099',
      status: 'approved',
      isApproved: true,
    }, {
      id: userId,
      fullName: 'Bình Nguyễn',
      email: 'binh@example.com',
    });

    expect(Post.create).toHaveBeenCalledWith({
      title: 'Cách chăm Monstera',
      content: 'Tưới cây mỗi tuần',
      thumbnail: 'monstera-1.jpg',
      images: ['monstera-1.jpg', 'monstera-2.jpg'],
      category: 'Chăm sóc cây',
      author: 'Bình Nguyễn',
      userId,
      status: 'pending',
      isApproved: false,
    });
    expect(result).toBe(createdPost);
  });
});

describe('postService.updatePost', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    ['Post ID', 'invalid-id', userId, 'ID bài viết không hợp lệ', 400],
    ['User ID', '507f1f77bcf86cd799439012', 'invalid-user', 'Người dùng không hợp lệ', 401],
  ])('từ chối %s không hợp lệ', async (_description, postId, currentUserId, message, statusCode) => {
    await expect(updatePost(postId, { title: 'Tiêu đề mới' }, { id: currentUserId }))
      .rejects.toMatchObject({ message, statusCode });

    expect(Post.findById).not.toHaveBeenCalled();
  });

  test('từ chối khi không tìm thấy bài viết', async () => {
    Post.findById.mockResolvedValue(null);

    await expect(updatePost(
      '507f1f77bcf86cd799439012',
      { title: 'Tiêu đề mới' },
      { id: userId },
    )).rejects.toMatchObject({
      message: 'Không tìm thấy bài viết',
      statusCode: 404,
    });
  });

  test('từ chối người dùng không phải chủ bài viết', async () => {
    const post = {
      _id: '507f1f77bcf86cd799439012',
      userId: '507f1f77bcf86cd799439099',
      save: jest.fn(),
    };
    Post.findById.mockResolvedValue(post);

    await expect(updatePost(
      post._id,
      { title: 'Tiêu đề mới' },
      { id: userId },
    )).rejects.toMatchObject({
      message: 'Bạn không có quyền cập nhật bài viết này',
      statusCode: 403,
    });

    expect(post.save).not.toHaveBeenCalled();
  });

  test.each([
    ['payload không có field hợp lệ', {}, 'Không có dữ liệu cập nhật hợp lệ'],
    ['tiêu đề rỗng', { title: ' ' }, 'Tiêu đề bài viết là bắt buộc'],
    ['nội dung rỗng', { content: '' }, 'Nội dung bài viết là bắt buộc'],
  ])('từ chối %s', async (_description, payload, message) => {
    const post = {
      _id: '507f1f77bcf86cd799439012',
      userId,
      save: jest.fn(),
    };
    Post.findById.mockResolvedValue(post);

    await expect(updatePost(post._id, payload, { id: userId })).rejects.toMatchObject({
      message,
      statusCode: 400,
    });

    expect(post.save).not.toHaveBeenCalled();
  });

  test('cho phép chủ bài sửa và đưa bài viết về trạng thái chờ duyệt', async () => {
    const post = {
      _id: '507f1f77bcf86cd799439012',
      userId,
      title: 'Tiêu đề cũ',
      content: 'Nội dung cũ',
      status: 'approved',
      isApproved: true,
      save: jest.fn(),
    };
    post.save.mockResolvedValue(post);
    Post.findById.mockResolvedValue(post);

    const result = await updatePost(post._id, {
      title: '  Tiêu đề mới  ',
      content: '  Nội dung mới  ',
      images: 'image-1.jpg, image-2.jpg',
      ignored: 'không được cập nhật',
    }, { id: userId });

    expect(post).toMatchObject({
      title: 'Tiêu đề mới',
      content: 'Nội dung mới',
      images: ['image-1.jpg', 'image-2.jpg'],
      status: 'pending',
      isApproved: false,
    });
    expect(post).not.toHaveProperty('ignored');
    expect(post.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(post);
  });
});
