// post.service.js - Business logic cho bài viết Plantify
const mongoose = require('mongoose');
const Post = require('./post.model');
require('../comments/comment.model');

function buildPostIdQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }

  return { _id: null };
}

function withRatingPipeline(extraStages = []) {
  return [
    ...extraStages,
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'ratingComments',
      },
    },
    {
      $addFields: {
        commentsCount: { $size: '$ratingComments' },
        avgRating: {
          $ifNull: [{ $round: [{ $avg: '$ratingComments.rating' }, 1] }, 0],
        },
      },
    },
    {
      $project: {
        ratingComments: 0,
        id: 0,
        excerpt: 0,
        likesCount: 0,
        likeCount: 0,
        isFeatured: 0,
        isActive: 0,
        readTime: 0,
      },
    },
  ];
}

/**
 * Lấy danh sách bài viết, có hỗ trợ lọc theo category, title và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách bài viết
 */
async function getAllPosts(filters = {}) {
  const { category, title, page, limit } = filters;
  const query = {};

  if (category) {
    query.category = category;
  }

  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }

  const pipeline = withRatingPipeline([
    { $match: query },
    { $sort: { createdAt: -1 } },
  ]);

  if (page && limit) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    pipeline.push({ $skip: (safePage - 1) * safeLimit }, { $limit: safeLimit });
  }

  return Post.aggregate(pipeline);
}

/**
 * Lấy chi tiết bài viết theo Mongo _id hoặc field id.
 * @param {string} id - Id bài viết
 * @returns {Promise<Object>} Chi tiết bài viết
 */
async function getPostById(id) {
  const post = await Post.findOne(buildPostIdQuery(id))
    .select('-id -excerpt -likesCount -likeCount -isFeatured -isActive -readTime')
    .populate({
      path: 'comments',
      populate: {
        path: 'userId',
        select: 'fullName email',
      },
    })
    .lean();

  if (!post) {
    const error = new Error('Không tìm thấy bài viết');
    error.statusCode = 404;
    throw error;
  }

  const ratedComments = post.comments?.filter((comment) => Number(comment.rating) > 0) || [];
  const avgRating = ratedComments.length
    ? Number(
        (
          ratedComments.reduce((total, comment) => total + Number(comment.rating || 0), 0) /
          ratedComments.length
        ).toFixed(1)
      )
    : 0;

  post.commentsCount = post.comments?.length || 0;
  post.avgRating = avgRating;

  return post;
}

/**
 * Lấy danh sách bài viết nổi bật.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách bài viết nổi bật
 */
async function getFeaturedPosts(filters = {}) {
  const safeLimit = Math.max(Number(filters.limit) || 3, 1);
  const pipeline = withRatingPipeline([]);

  pipeline.push({ $sort: { avgRating: -1, createdAt: -1 } }, { $limit: safeLimit });

  return Post.aggregate(pipeline);
}

module.exports = { getAllPosts, getPostById, getFeaturedPosts };
