/**
 * Blog.jsx - Trang blog co filter category/search va modal chi tiet bai viet.
 */
import { useEffect, useState } from "react";
import BlogPostDetail, {
  BlogPostDetailError,
  BlogPostDetailSkeleton,
} from "@/components/common/BlogPostDetail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostDetail, usePosts } from "@/features/posts/hooks";
import { Search, Calendar, User, ArrowRight, X, Star } from "lucide-react";
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
  return {
    ...post,
    id: post._id,
    image: post.thumbnail || post.images?.[0],
    date: formatPostDate(post.createdAt),
    preview: getPostPreview(post.content)
  };
}

function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const hasActiveFilters = Boolean(selectedCategory || searchTerm.trim());
  const { posts: apiPosts, loading, error } = usePosts({
    page: 1,
    limit: 6,
    category: selectedCategory,
    search: debouncedSearchTerm,
  });
  const {
    post: detailPost,
    comments: detailComments,
    loading: detailLoading,
    error: detailError,
  } = usePostDetail(showDetail ? selectedPost?._id || selectedPost?.id : null);

  const blogPosts = apiPosts.map(mapPostToBlogCard);
  const featuredPost = blogPosts[0];
  const gridPosts = blogPosts.slice(1);
  const activePost = detailPost || selectedPost;
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

  function handleSelectCategory(category) {
    setSelectedCategory(category === categories[0] ? "" : category);
  }

  function handleClearFilters() {
    setSelectedCategory("");
    setSearchTerm("");
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
    if (!showDetail) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleCloseDetail();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDetail]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-7xl overflow-hidden">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">Blog & Cộng đồng</h1>
          <p className="text-xl text-muted-foreground">
            Kiến thức, kinh nghiệm và câu chuyện từ cộng đồng yêu cây cảnh
          </p>
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
                  <div className="aspect-video min-w-0 overflow-hidden md:aspect-auto md:h-full">
                    <img
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
                      <div className="aspect-video w-full max-w-full overflow-hidden">
                        <img
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
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">Xem thêm bài viết</Button>
        </div>

        {showDetail && detailLoading && !detailPost && (
          <BlogPostDetailSkeleton onClose={handleCloseDetail} />
        )}

        {showDetail && detailError && !detailLoading && !detailPost && (
          <BlogPostDetailError message={detailError} onClose={handleCloseDetail} />
        )}

        {showDetail && activePost && (!detailLoading || detailPost) && (
          <BlogPostDetail
            post={activePost}
            comments={activeComments}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
}

export { Blog };
