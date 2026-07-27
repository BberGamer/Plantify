// BlogDetailLayer.jsx - Hiển thị lớp chi tiết bài viết và trạng thái liên quan
import BlogPostDetail, {
  BlogPostDetailError,
  BlogPostDetailSkeleton,
} from "@/components/common/BlogPostDetail";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function BlogDetailLayer({
  comments,
  detailError,
  detailLoading,
  detailPost,
  displayPost,
  onCloseDetail,
  onClosePreview,
  previewImage,
  showDetail,
}) {
  return (
    <>
      {showDetail && detailLoading && !detailPost && (
        <BlogPostDetailSkeleton onClose={onCloseDetail} />
      )}

      {showDetail && detailError && !detailLoading && !detailPost && (
        <BlogPostDetailError message={detailError} onClose={onCloseDetail} />
      )}

      {showDetail && displayPost && (!detailLoading || detailPost) && (
        <BlogPostDetail post={displayPost} comments={comments} onClose={onCloseDetail} />
      )}

      {previewImage && (
        <div
          className="blog-image-preview"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh bài viết"
          onClick={onClosePreview}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/20 hover:text-white"
            aria-label="Đóng ảnh"
            onClick={onClosePreview}
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
    </>
  );
}

export { BlogDetailLayer };
