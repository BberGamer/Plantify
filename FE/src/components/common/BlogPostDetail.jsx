// BlogPostDetail.jsx - Hiển thị modal chi tiết bài viết cùng trạng thái tải, lỗi và bình luận
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";




import { ImageCarousel } from "@/components/common/ImageCarousel";
import { useAuth } from "@/features/auth/hooks";
import { useComments } from "@/features/comments/hooks";
import { useCreateReport } from "@/features/reports/hooks";
import { toast } from "sonner";
import { BlogReportDialog } from "@/components/common/blog-post-detail/BlogReportDialog";
import { BlogCommentsSection } from "@/components/common/blog-post-detail/BlogCommentsSection";
import {
  BlogPostDetailError,
  BlogPostDetailSkeleton,
} from "@/components/common/blog-post-detail/BlogPostDetailStates";
import {
  BlogPostArticleContent,
  BlogPostModalHeader,
} from "@/components/common/blog-post-detail/BlogPostArticleSections";

const REPORT_REASONS = [
  { value: "spam", label: "Bài viết là spam" },
  { value: "sensitive", label: "Nội dung nhạy cảm" },
  { value: "copyright", label: "Vi phạm bản quyền" },
  { value: "inappropriate", label: "Nội dung không phù hợp" },
];

/**
 * Format ngay gio theo ngon ngu hien tai cua UI.
 * @param {string|Date} date - Gia tri ngay tu API
 * @returns {string} Chuoi ngay da format
 */
function formatDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getEntityId(entity) {
  if (!entity) {
    return "";
  }

  if (typeof entity === "string") {
    return entity;
  }

  return entity._id || entity.id || entity.userId || "";
}

/**
 * Hien thi chi tiet bai viet, gallery anh, metadata va khu vuc binh luan.
 * @param {object} props
 * @param {object} props.post - Du lieu day du cua bai viet
 * @param {Function} props.onClose - Callback dong modal/card
 * @param {Array} props.comments - Danh sach binh luan da populate tu API
 * @returns {JSX.Element|null} Blog post detail UI
 */
function BlogPostDetail({ post, onClose, comments = [] }) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0].value);
  const { createReport, loading: reporting } = useCreateReport();

  const images = useMemo(() => {
    const gallery = [post?.thumbnail, ...(post?.images || [])].filter(Boolean);
    return Array.from(new Set(gallery));
  }, [post]);
  const postId = post?._id || post?.id;
  const {
    comments: liveComments,
    loading: commentsLoading,
    error: commentsError,
    createPostComment,
  } = useComments(postId, comments);
  const currentUserId = getEntityId(user);
  const postOwnerId = getEntityId(post?.userId);
  const isOwnPost = Boolean(currentUserId && postOwnerId && currentUserId === postOwnerId);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (!reportDialogOpen) {
          onClose?.();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, reportDialogOpen]);

  if (!post) {
    return null;
  }

  const authorName = post.author?.fullName || post.author?.name || post.author || "Plantify";
  const fallbackCommentCount = post.commentsCount || comments.length || 0;
  const commentCount = commentsLoading || commentsError ? fallbackCommentCount : liveComments.length;
  const postDate = formatDate(post.createdAt);

  /**
   * Gui comment moi len API va refetch danh sach comments sau khi tao thanh cong.
   * @param {SubmitEvent} event - Form submit event
   * @returns {Promise<void>}
   */
  async function handleSubmitComment(event) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setSubmitError("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (!user || !postId) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createPostComment({
        userId: user._id || user.id,
        postId,
        content: trimmedContent,
        rating,
      });
      setContent("");
      setRating(5);
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Không thể gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenReportDialog() {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để báo cáo bài viết");
      return;
    }

    if (isOwnPost) {
      toast.error("Bạn không thể báo cáo bài viết của chính mình");
      return;
    }

    setReportReason(REPORT_REASONS[0].value);
    setReportDialogOpen(true);
  }

  async function handleSubmitReport(event) {
    event.preventDefault();

    if (!postId) {
      toast.error("Không tìm thấy bài viết để báo cáo");
      return;
    }

    try {
      await createReport(postId, reportReason);
      toast.success("Đã gửi báo cáo bài viết");
      setReportDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Không thể gửi báo cáo");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <motion.div
        className="mx-auto w-full max-w-5xl"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Card className="overflow-hidden border-green-200/70 bg-white shadow-2xl">
          <BlogPostModalHeader
            category={post.category}
            isOwnPost={isOwnPost}
            onClose={onClose}
            onOpenReport={handleOpenReportDialog}
            postDate={postDate}
          />

          {images.length > 0 && (
            <section className="bg-gradient-to-br from-green-50/60 to-white p-3 sm:p-4">
              <ImageCarousel images={images} alt={post.title} className="aspect-video" />
            </section>
          )}

          <CardContent className="space-y-7 p-4 sm:space-y-8 sm:p-8">
            <BlogPostArticleContent
              authorName={authorName}
              averageRating={post.avgRating}
              commentCount={commentCount}
              content={post.content}
              postDate={postDate}
              title={post.title}
            />

            <BlogCommentsSection
              commentCount={commentCount}
              commentsError={commentsError}
              commentsLoading={commentsLoading}
              content={content}
              isAuthenticated={isAuthenticated}
              liveComments={liveComments}
              onContentChange={setContent}
              onRatingChange={setRating}
              onSubmit={handleSubmitComment}
              rating={rating}
              submitError={submitError}
              submitting={submitting}
              user={user}
            />
          </CardContent>
        </Card>
      </motion.div>

      <BlogReportDialog
        loading={reporting}
        onOpenChange={setReportDialogOpen}
        onReasonChange={setReportReason}
        onSubmit={handleSubmitReport}
        open={reportDialogOpen}
        reason={reportReason}
        reasons={REPORT_REASONS}
      />
    </motion.div>
  );
}

export { BlogPostDetail, BlogPostDetailError, BlogPostDetailSkeleton };
export default BlogPostDetail;
