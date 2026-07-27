/**
 * Blog.jsx - Trang blog co filter category/search va modal chi tiet bai viet.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import BlogPostDetail, {
  BlogPostDetailError,
  BlogPostDetailSkeleton,
} from "@/components/common/BlogPostDetail";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreatePost, usePostDetail, usePosts } from "@/features/posts/hooks";
import { Search, Calendar, User, ArrowRight, X, Star, PenSquare } from "lucide-react";
import { motion } from "motion/react";
import { BlogPostGrid } from "@/features/posts/components/blog/BlogPostGrid";
import { BlogContent } from "@/features/posts/components/blog/BlogContent";

const categories = [
  "Tất cả",
  "Hướng dẫn",
  "Bệnh & Điều trị",
  "Phòng ngừa",
  "Chăm sóc",
  "Thiết kế",
  "Kỹ thuật"
];

const BLOG_GRID_PAGE_SIZE = 6;
const BLOG_FIRST_PAGE_LIMIT = BLOG_GRID_PAGE_SIZE + 1;

const vietnameseTextReplacements = [
  [/\bBai dau tien\b/gi, "Bài đầu tiên"],
  [/\bBai (?=\d)/g, "Bài "],
  [/\bbai (?=\d)/g, "bài "],
  [/\bquoc anh\b/gi, "Quốc Anh"],
  [/\bTat ca\b/gi, "Tất cả"],
  [/\bHuong dan\b/gi, "Hướng dẫn"],
  [/\bBenh & Dieu tri\b/gi, "Bệnh & Điều trị"],
  [/\bPhong ngua\b/gi, "Phòng ngừa"],
  [/\bCham soc\b/gi, "Chăm sóc"],
  [/\bThiet ke\b/gi, "Thiết kế"],
  [/\bKy thuat\b/gi, "Kỹ thuật"]
];

function formatVietnameseDisplayText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return vietnameseTextReplacements.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value
  );
}

/**
 * Format ngày tạo bài viết để hiển thị trong UI blog.
 * @param {string|Date} date - Ngày tạo bài viết từ API
 * @returns {string} Ngày đã format theo tiếng Việt
 */
function formatPostDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function getPostPreview(content = "", maxLength = 140) {
  const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trim()}...`;
}

function getPostIdentity(post) {
  return post?._id || post?.id;
}

function compareFeaturedPosts(postA, postB) {
  const commentsDelta = (Number(postB.commentsCount) || 0) - (Number(postA.commentsCount) || 0);

  if (commentsDelta !== 0) {
    return commentsDelta;
  }

  return new Date(postB.createdAt || 0).getTime() - new Date(postA.createdAt || 0).getTime();
}

function RatingSummary({ value }) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 5));

  return (
    <div className="flex items-center gap-1 text-amber-500">
      <Star className={`h-4 w-4 ${safeValue > 0 ? "fill-current" : ""}`} />
      <span className="text-sm font-medium text-foreground">{safeValue.toFixed(1)}</span>
    </div>
  );
}

/**
 * Chuẩn hóa dữ liệu bài viết từ API về shape UI đang sử dụng.
 * @param {Object} post - Bài viết từ backend
 * @returns {Object} Bài viết đã map field cho Blog page
 */
function mapPostToBlogCard(post) {
  const content = formatVietnameseDisplayText(post.content);

  return {
    ...post,
    id: post._id,
    title: formatVietnameseDisplayText(post.title),
    content,
    category: formatVietnameseDisplayText(post.category),
    author: formatVietnameseDisplayText(post.author),
    image: post.thumbnail || post.images?.[0] || "",
    date: formatPostDate(post.createdAt),
    preview: getPostPreview(content)
  };
}

function Blog() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const hasActiveFilters = Boolean(selectedCategory || searchTerm.trim());
  const { posts: apiPosts, loading, loadingMore, error, hasMore, loadMore, refetch } = usePosts({
    page: 1,
    limit: BLOG_FIRST_PAGE_LIMIT,
    category: selectedCategory,
    search: debouncedSearchTerm,
  });
  const { create, loading: creating } = useCreatePost();
  const {
    post: detailPost,
    comments: detailComments,
    loading: detailLoading,
    error: detailError,
  } = usePostDetail(showDetail ? selectedPost?._id || selectedPost?.id : null);

  const blogPosts = useMemo(() => apiPosts.map(mapPostToBlogCard), [apiPosts]);
  const featuredPost = useMemo(() => {
    const firstPagePosts = blogPosts.slice(0, BLOG_FIRST_PAGE_LIMIT);

    return [...firstPagePosts].sort(compareFeaturedPosts)[0] || null;
  }, [blogPosts]);
  const gridPosts = useMemo(() => {
    const featuredPostId = getPostIdentity(featuredPost);

    return blogPosts.filter((post) => getPostIdentity(post) !== featuredPostId);
  }, [blogPosts, featuredPost]);
  const activePost = detailPost || selectedPost;
  const activeDisplayPost = activePost ? mapPostToBlogCard(activePost) : null;
  const activeComments = detailPost ? detailComments : selectedPost?.comments || [];
  const showInitialLoading = loading && !blogPosts.length;
  const showErrorState = Boolean(error) && !loading;
  const showEmptyState = !loading && !error && !featuredPost;
  const showPosts = !loading && !error && featuredPost;
  const showLoadMore = showPosts && hasMore;

  /**
   * Mo modal chi tiet va kich hoat hook fetch full data cho bai viet duoc chon.
   * @param {Object} post - Bai viet tu danh sach blog
   */
  function handleOpenPost(post) {
    setSelectedPost(post);
    setShowDetail(true);
  }

  /**
   * Dong modal chi tiet nhung giu list/search/categories khong bi reset.
   */
  function handleCloseDetail() {
    setShowDetail(false);
  }

  function handleOpenPreviewImage(event, post) {
    event.stopPropagation();

    if (!post.image) {
      return;
    }

    setPreviewImage({
      src: post.image,
      alt: post.title
    });
  }

  function handleClosePreviewImage() {
    setPreviewImage(null);
  }

  function handleSelectCategory(category) {
    setSelectedCategory(category === categories[0] ? "" : category);
  }

  function handleClearFilters() {
    setSelectedCategory("");
    setSearchTerm("");
  }

  async function handleCreatePost(payload) {
    try {
      await create(payload);
      toast.success("Bài viết đã được gửi và đang chờ duyệt");
      setCreateFormKey((current) => current + 1);
      setCreatingPost(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tạo bài viết");
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!showDetail && !previewImage) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (previewImage) {
          handleClosePreviewImage();
          return;
        }

        handleCloseDetail();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDetail, previewImage]);

  useEffect(() => {
    const openPostId = location.state?.openPostId;

    if (!openPostId) {
      return;
    }

    setSelectedPost({ _id: openPostId, id: openPostId });
    setShowDetail(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  return (
    <BlogContent RatingSummary={RatingSummary} activeComments={activeComments} activeDisplayPost={activeDisplayPost} categories={categories} createFormKey={createFormKey} creating={creating} creatingPost={creatingPost} detailError={detailError} detailLoading={detailLoading} detailPost={detailPost} error={error} featuredPost={featuredPost} gridPosts={gridPosts} handleClearFilters={handleClearFilters} handleCloseDetail={handleCloseDetail} handleClosePreviewImage={handleClosePreviewImage} handleCreatePost={handleCreatePost} handleOpenPost={handleOpenPost} handleOpenPreviewImage={handleOpenPreviewImage} handleSelectCategory={handleSelectCategory} hasActiveFilters={hasActiveFilters} loadMore={loadMore} loadingMore={loadingMore} previewImage={previewImage} refetch={refetch} searchTerm={searchTerm} selectedCategory={selectedCategory} setCreatingPost={setCreatingPost} setSearchTerm={setSearchTerm} showDetail={showDetail} showEmptyState={showEmptyState} showErrorState={showErrorState} showInitialLoading={showInitialLoading} showLoadMore={showLoadMore} showPosts={showPosts} />
  );
}

export { Blog };
