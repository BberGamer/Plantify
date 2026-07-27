/**
 * Blog.jsx - Trang blog co filter category/search va modal chi tiet bai viet.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreatePost, usePostDetail, usePosts } from "@/features/posts/hooks";

import { BlogCreateDialog } from "@/features/posts/components/blog/BlogCreateDialog";
import { BlogDetailLayer } from "@/features/posts/components/blog/BlogDetailLayer";
import { BlogFeedState } from "@/features/posts/components/blog/BlogFeedState";
import { BlogHeaderFilters } from "@/features/posts/components/blog/BlogHeaderFilters";
import { BlogPostResults } from "@/features/posts/components/blog/BlogPostResults";
import {
  BLOG_FIRST_PAGE_LIMIT,
  RatingSummary,
  categories,
  compareFeaturedPosts,
  getPostIdentity,
  mapPostToBlogCard,
} from "@/features/posts/blogPage.support";
import "@/styles/Blog.css";

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
  const feedStatus = showInitialLoading
    ? "loading"
    : showErrorState
      ? "error"
      : showEmptyState
        ? "empty"
        : null;
  const feedMessage =
    feedStatus === "loading"
      ? "Đang tải danh sách bài viết..."
      : feedStatus === "error"
        ? `Không thể tải danh sách bài viết: ${error}`
        : hasActiveFilters
          ? "Không tìm thấy bài viết phù hợp."
          : "Chưa có bài viết nào.";

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
    <div className="blog-page">
      <div className="blog-page-content">
        <BlogHeaderFilters
          categories={categories}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          onCreatePost={() => setCreatingPost(true)}
          onSearchChange={setSearchTerm}
          onSelectCategory={handleSelectCategory}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
        />

        <BlogFeedState
          message={feedMessage}
          onRetry={refetch}
          status={feedStatus}
        />

        {showPosts && (
          <BlogPostResults
            featuredPost={featuredPost}
            gridPosts={gridPosts}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            onOpenPost={handleOpenPost}
            onOpenPreviewImage={handleOpenPreviewImage}
            ratingSummary={RatingSummary}
            showLoadMore={showLoadMore}
          />
        )}

        <BlogDetailLayer
          comments={activeComments}
          detailError={detailError}
          detailLoading={detailLoading}
          detailPost={detailPost}
          displayPost={activeDisplayPost}
          onCloseDetail={handleCloseDetail}
          onClosePreview={handleClosePreviewImage}
          previewImage={previewImage}
          showDetail={showDetail}
        />

        <BlogCreateDialog
          createFormKey={createFormKey}
          creating={creating}
          onCreatePost={handleCreatePost}
          onOpenChange={setCreatingPost}
          open={creatingPost}
        />
      </div>
    </div>
  );
}

export { Blog };
