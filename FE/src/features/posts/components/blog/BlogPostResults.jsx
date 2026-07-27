import { Button } from "@/components/ui/button";
import { BlogPostGrid } from "@/features/posts/components/blog/BlogPostGrid";

function BlogPostResults({
  featuredPost,
  gridPosts,
  loadingMore,
  onLoadMore,
  onOpenPost,
  onOpenPreviewImage,
  ratingSummary,
  showLoadMore,
}) {
  return (
    <>
      <BlogPostGrid
        RatingSummary={ratingSummary}
        featuredPost={featuredPost}
        gridPosts={gridPosts}
        handleOpenPost={onOpenPost}
        handleOpenPreviewImage={onOpenPreviewImage}
      />

      {showLoadMore && (
        <div className="mt-12 text-center" aria-busy={loadingMore}>
          <Button
            size="lg"
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Đang tải..." : "Xem thêm bài viết"}
          </Button>
        </div>
      )}
    </>
  );
}

export { BlogPostResults };
