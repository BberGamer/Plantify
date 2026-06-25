/**
 * Blog.jsx - Trang blog co filter category/search va modal chi tiet bai viet.
 */
import { useEffect, useMemo, useState } from "react";
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

  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-7xl overflow-hidden">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
          <h1 className="text-5xl font-bold mb-2">Blog & Cộng đồng</h1>
          <p className="text-xl text-muted-foreground">
            Kiến thức, kinh nghiệm và câu chuyện từ cộng đồng yêu cây cảnh
          </p>
          </div>
          <Button
            type="button"
            size="icon"
            className="self-end rounded-full shadow-md sm:self-start"
            onClick={() => setCreatingPost(true)}
            aria-label="Tạo bài viết mới"
          >
            <PenSquare className="h-5 w-5" />
          </Button>
        </div>

        {/* Search & Categories */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={
                  (!selectedCategory && category === categories[0]) || selectedCategory === category
                    ? "default"
                    : "secondary"
                }
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => handleSelectCategory(category)}
              >
                {category}
              </Badge>
            ))}

            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <div className="py-12 text-center text-muted-foreground">
            Đang tải danh sách bài viết...
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-destructive">
            Không thể tải danh sách bài viết: {error}
          </div>
        )}

        {!loading && !error && !featuredPost && (
          <div className="py-12 text-center text-muted-foreground">
            {hasActiveFilters ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết nào."}
          </div>
        )}

        {!loading && !error && featuredPost && (
          <>
            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 w-full max-w-full overflow-hidden"
            >
              <Card
                className="w-full max-w-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer md:max-h-[360px]"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenPost(featuredPost)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenPost(featuredPost);
                  }
                }}
              >
                <div className="grid w-full max-w-full overflow-hidden md:h-[360px] md:grid-cols-2">
                  <div
                    className="aspect-video min-w-0 cursor-zoom-in overflow-hidden md:aspect-auto md:h-full"
                    onClick={(event) => handleOpenPreviewImage(event, featuredPost)}
                  >
                    <ImageWithFallback
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex min-w-0 flex-col justify-center overflow-hidden p-6 sm:p-8">
                    <Badge className="w-fit mb-4 bg-primary">Nổi bật</Badge>
                    <Badge variant="secondary" className="w-fit mb-4">
                      {featuredPost.category}
                    </Badge>
                    <h2 className="mb-4 break-words text-2xl font-bold sm:text-3xl">{featuredPost.title}</h2>
                    <p className="mb-6 line-clamp-3 break-words text-muted-foreground">{featuredPost.preview}</p>
                    <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="break-words">{featuredPost.author}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="break-words">{featuredPost.date}</span>
                      </div>
                      <RatingSummary value={featuredPost.avgRating} />
                    </div>
                    <Button
                      size="lg"
                      className="w-fit"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenPost(featuredPost);
                      }}
                    >
                        Đọc bài viết
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </motion.div>

            {/* Blog Grid */}
            <div className="grid w-full max-w-full grid-cols-1 gap-6 overflow-hidden md:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-w-0"
                >
                  <button
                    type="button"
                    className="block h-full w-full max-w-full overflow-hidden text-left"
                    onClick={() => handleOpenPost(post)}
                  >
                    <Card className="group h-full w-full max-w-full cursor-pointer overflow-hidden border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div
                        className="aspect-video w-full max-w-full cursor-zoom-in overflow-hidden"
                        onClick={(event) => handleOpenPreviewImage(event, post)}
                      >
                        <ImageWithFallback
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="min-w-0 p-6">
                        <Badge variant="secondary" className="mb-3">
                          {post.category}
                        </Badge>
                        <h3 className="mb-3 line-clamp-2 break-words font-bold">{post.title}</h3>
                        <p className="mb-4 line-clamp-2 break-words text-sm text-muted-foreground">
                          {post.preview}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex min-w-0 items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="break-words">{post.author}</span>
                          </div>
                          <span>•</span>
                          <RatingSummary value={post.avgRating} />
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Load More */}
        {!loading && !error && hasMore && featuredPost && (
          <div className="mt-12 text-center" aria-busy={loadingMore}>
            <Button size="lg" variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Đang tải..." : "Xem thêm bài viết"}
            </Button>
          </div>
        )}

        {showDetail && detailLoading && !detailPost && (
          <BlogPostDetailSkeleton onClose={handleCloseDetail} />
        )}

        {showDetail && detailError && !detailLoading && !detailPost && (
          <BlogPostDetailError message={detailError} onClose={handleCloseDetail} />
        )}

        {showDetail && activeDisplayPost && (!detailLoading || detailPost) && (
          <BlogPostDetail
            post={activeDisplayPost}
            comments={activeComments}
            onClose={handleCloseDetail}
          />
        )}

        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh bài viết"
            onClick={handleClosePreviewImage}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white hover:bg-white/20 hover:text-white"
              aria-label="Đóng ảnh"
              onClick={handleClosePreviewImage}
            >
              <X className="h-6 w-6" />
            </Button>
            <ImageWithFallback
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}

        <Dialog open={creatingPost} onOpenChange={setCreatingPost}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tạo bài viết mới</DialogTitle>
              <DialogDescription>
                Bài viết của bạn sẽ ở trạng thái chờ duyệt sau khi gửi.
              </DialogDescription>
            </DialogHeader>
            <CreatePostForm
              key={createFormKey}
              loading={creating}
              onCancel={() => setCreatingPost(false)}
              onSubmit={handleCreatePost}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export { Blog };
