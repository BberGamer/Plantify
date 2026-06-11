import { useEffect, useState } from "react";
import BlogPostDetail from "@/components/common/BlogPostDetail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostDetail, usePosts } from "@/features/posts/hooks";
import { Search, Calendar, User, ArrowRight, X } from "lucide-react";
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

/**
 * Chuẩn hóa dữ liệu bài viết từ API về shape UI đang sử dụng.
 * @param {Object} post - Bài viết từ backend
 * @returns {Object} Bài viết đã map field cho Blog page
 */
function mapPostToBlogCard(post) {
  return {
    ...post,
    id: post._id || post.id,
    image: post.thumbnail || post.images?.[0],
    date: formatPostDate(post.createdAt),
    readTime: post.readTime || "5 phút đọc"
  };
}

/**
 * Skeleton hien thi trong luc dang tai chi tiet bai viet.
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Callback dong skeleton modal
 * @returns {JSX.Element} Loading UI cho modal chi tiet
 */
function BlogPostDetailSkeleton({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <Card className="overflow-hidden border-green-200/70 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-green-100 px-5 py-4">
            <div className="h-6 w-28 animate-pulse rounded-full bg-green-100" />
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Dong
            </Button>
          </div>
          <div className="grid gap-3 bg-gradient-to-br from-green-50/60 to-white p-4 md:grid-cols-[1.5fr_1fr]">
            <div className="aspect-video animate-pulse rounded-lg bg-green-100" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-video animate-pulse rounded-lg bg-green-100/80" />
              ))}
            </div>
          </div>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="h-10 w-3/4 animate-pulse rounded bg-green-100" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-5/6 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-5 animate-pulse rounded bg-green-100/80" />
              ))}
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-4 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/**
 * Trang thai loi khi khong the tai chi tiet bai viet.
 * @param {Object} props - Component props
 * @param {string} props.message - Noi dung loi
 * @param {Function} props.onClose - Callback dong modal
 * @returns {JSX.Element} Error modal cho detail
 */
function BlogPostDetailError({ message, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <Card className="border-destructive/20 bg-white shadow-2xl">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Khong the tai bai viet</h2>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Button className="bg-gradient-to-r from-primary to-green-600 text-white" onClick={onClose}>
              Quay lai Blog
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const { posts: apiPosts, loading, error } = usePosts({ page: 1, limit: 6 });
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
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
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
              className="pl-12 h-12 text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
              >
                {category}
              </Badge>
            ))}
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
            Chưa có bài viết nào.
          </div>
        )}

        {!loading && !error && featuredPost && (
          <>
            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card
                className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
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
                <div className="grid md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-primary">Nổi bật</Badge>
                    <Badge variant="secondary" className="w-fit mb-4">
                      {featuredPost.category}
                    </Badge>
                    <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                    <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{featuredPost.date}</span>
                      </div>
                      <span>• {featuredPost.readTime}</span>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    type="button"
                    className="block h-full w-full text-left"
                    onClick={() => handleOpenPost(post)}
                  >
                    <Card className="overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">
                          {post.category}
                        </Badge>
                        <h3 className="font-bold mb-3 line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{post.author}</span>
                          </div>
                          <span>•</span>
                          <span>{post.readTime}</span>
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
