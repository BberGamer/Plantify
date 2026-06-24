/**
 * BlogSection.jsx - Section hiển thị blog posts trên Home
 */
import { Link } from "react-router";
import { motion } from "motion/react";
import { usePosts } from "@/features/posts/hooks";
import { useBlogDetail } from "../hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BlogPostDetail, {
  BlogPostDetailError,
  BlogPostDetailSkeleton,
} from "@/components/common/BlogPostDetail";

export function BlogSection() {
  const { posts: apiPosts } = usePosts({ page: 1, limit: 3 });
  const {
    showDetailHome,
    detailPostHome,
    detailCommentsHome,
    detailLoadingHome,
    detailErrorHome,
    activePostHome,
    activeCommentsHome,
    handleOpenPostHome,
    handleClosePostHome,
  } = useBlogDetail();

  const blogCards = apiPosts.map((post) => ({
    ...post,
    id: post.id || post._id,
    title: post.title,
    category: post.category,
    image: post.thumbnail || post.images?.[0],
  }));

  return (
    <>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">Cộng đồng & Blog</h2>
            <p className="text-muted-foreground">
              Chia sẻ kinh nghiệm và kiến thức chăm sóc cây cảnh
            </p>
          </div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/blog">Xem tất cả</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogCards.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                type="button"
                className="block h-full w-full text-left"
                onClick={() => handleOpenPostHome(article)}
              >
                <Card className="h-full overflow-hidden border border-border hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover blog-card-image"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold mb-2">{article.title}</h3>
                    <span className="inline-flex h-auto p-0 text-sm font-medium text-primary">
                      Đọc thêm →
                    </span>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blog Detail Modal */}
      {showDetailHome && detailLoadingHome && !detailPostHome && (
        <BlogPostDetailSkeleton onClose={handleClosePostHome} />
      )}

      {showDetailHome && detailErrorHome && !detailLoadingHome && !detailPostHome && (
        <BlogPostDetailError message={detailErrorHome} onClose={handleClosePostHome} />
      )}

      {showDetailHome && activePostHome && (!detailLoadingHome || detailPostHome) && (
        <BlogPostDetail
          post={activePostHome}
          comments={activeCommentsHome}
          onClose={handleClosePostHome}
        />
      )}
    </>
  );
}
