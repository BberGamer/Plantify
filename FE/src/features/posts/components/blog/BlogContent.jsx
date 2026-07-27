import BlogPostDetail, {
  BlogPostDetailError,
  BlogPostDetailSkeleton,
} from "@/components/common/BlogPostDetail";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
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
import { Search, Calendar, User, ArrowRight, X, Star, PenSquare } from "lucide-react";
import { BlogPostGrid } from "@/features/posts/components/blog/BlogPostGrid";

function BlogContent({ RatingSummary, activeComments, activeDisplayPost, categories, createFormKey, creating, creatingPost, detailError, detailLoading, detailPost, error, featuredPost, gridPosts, handleClearFilters, handleCloseDetail, handleClosePreviewImage, handleCreatePost, handleOpenPost, handleOpenPreviewImage, handleSelectCategory, hasActiveFilters, loadMore, loadingMore, previewImage, refetch, searchTerm, selectedCategory, setCreatingPost, setSearchTerm, showDetail, showEmptyState, showErrorState, showInitialLoading, showLoadMore, showPosts }) {
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

        {showInitialLoading && (
          <div className="py-12 text-center text-muted-foreground">
            Đang tải danh sách bài viết...
          </div>
        )}

        {showErrorState && (
          <div className="py-12 text-center">
            <p className="mb-4 text-destructive">Không thể tải danh sách bài viết: {error}</p>
            <Button type="button" variant="outline" onClick={refetch}>
              Thử lại
            </Button>
          </div>
        )}

        {showEmptyState && (
          <div className="py-12 text-center text-muted-foreground">
            {hasActiveFilters ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết nào."}
          </div>
        )}

        {showPosts && (
          <BlogPostGrid RatingSummary={RatingSummary} featuredPost={featuredPost} gridPosts={gridPosts} handleOpenPost={handleOpenPost} handleOpenPreviewImage={handleOpenPreviewImage} />
        )}

        {/* Load More */}
        {showLoadMore && (
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

export { BlogContent };
