import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePosts } from "@/features/posts/hooks";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
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
    id: post.id || post._id,
    image: post.thumbnail || post.images?.[0],
    date: formatPostDate(post.createdAt),
    readTime: post.readTime || "5 phút đọc"
  };
}

function Blog() {
  const { posts: apiPosts, loading, error } = usePosts({ page: 1, limit: 6 });
  const blogPosts = apiPosts.map(mapPostToBlogCard);
  const featuredPost = blogPosts[0];
  const gridPosts = blogPosts.slice(1);

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
              <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
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
                    <Button size="lg" className="w-fit" asChild>
                      <Link to={`/blog/${featuredPost.id}`}>
                        Đọc bài viết
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
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
                  <Link to={`/blog/${post.id}`}>
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
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">Xem thêm bài viết</Button>
        </div>
      </div>
    </div>
  );
}

export { Blog };
