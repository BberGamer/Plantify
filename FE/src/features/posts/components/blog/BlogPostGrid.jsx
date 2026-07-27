import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

function BlogPostGrid({
  RatingSummary,
  featuredPost,
  gridPosts,
  handleOpenPost,
  handleOpenPreviewImage,
}) {
  return (
<>
            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 w-full max-w-full overflow-hidden"
            >
              <Card
                className="blog-featured-card"
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
                    <Card className="blog-grid-card group">
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
  );
}

export { BlogPostGrid };
