/**
 * BlogPostDetail.jsx - Modal chi tiet bai viet, loading skeleton, error state va binh luan.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Flag,
  Loader2,
  MessageCircle,
  Send,
  Star,
  User,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { useAuth } from "@/features/auth/hooks";
import { useComments } from "@/features/comments/hooks";
import { useCreateReport } from "@/features/reports/hooks";
import { toast } from "sonner";

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

/**
 * Lay chu cai dau de hien thi trong avatar fallback.
 * @param {string} name - Ten nguoi dung
 * @returns {string} Initials ngan gon
 */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "U";
  }

  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

/**
 * Tach thong tin tac gia comment tu cac shape response pho bien.
 * @param {object} comment - Comment tu API
 * @returns {{ name: string, avatarUrl: string }}
 */
function getCommentAuthor(comment) {
  const author = comment.userId || comment.user || comment.author || {};
  const name = author.fullName || author.name || comment.fullName || comment.name || "Người dùng Plantify";

  return {
    name,
    avatarUrl: author.avatarUrl || comment.avatarUrl || "",
  };
}

/**
 * Render rating bang icon sao de giu UI gon va de scan.
 * @param {object} props - Component props
 * @param {number} props.rating - Diem danh gia 1-5
 * @param {Function} props.onChange - Callback khi bam sao trong form
 * @returns {JSX.Element|null} Cum sao rating
 */
function RatingStars({ rating, onChange }) {
  const safeRating = Math.max(0, Math.min(Number(rating) || 0, 5));

  if (!safeRating && !onChange) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${safeRating}/5 sao`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <button
          key={index}
          type="button"
          className={`rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            onChange ? "cursor-pointer hover:text-amber-600" : "cursor-default"
          }`}
          onClick={() => onChange?.(index + 1)}
          disabled={!onChange}
          aria-label={`Chọn ${index + 1} sao`}
        >
          <Star
            className={`h-4 w-4 ${index < safeRating ? "fill-current" : "text-muted-foreground/30"}`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ value }) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 5));

  return (
    <div className="flex items-center gap-2">
      <RatingStars rating={Math.round(safeValue)} />
      <span>{safeValue.toFixed(1)} sao</span>
    </div>
  );
}

function BlogPostDetailSkeleton({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
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
              Đóng
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

function BlogPostDetailError({ message, onClose, actionLabel = "Quay lại Blog" }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
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
                <h2 className="text-xl font-bold text-foreground">Không thể tải bài viết</h2>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Button className="bg-gradient-to-r from-primary to-green-600 text-white" onClick={onClose}>
              {actionLabel}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
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
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-green-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 gap-2 rounded-full text-green-700 hover:bg-green-50 hover:text-green-800"
                onClick={onClose}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
              <Badge className="shrink-0 bg-green-100 text-green-700 hover:bg-green-100">
                {post.category || "Blog"}
              </Badge>
              <span className="truncate text-sm text-muted-foreground">{formatDate(post.createdAt)}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full hover:bg-amber-50 hover:text-amber-700"
              onClick={handleOpenReportDialog}
              aria-label="Báo cáo bài viết"
            >
              <Flag className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full hover:bg-green-50 hover:text-green-700"
              onClick={onClose}
              aria-label="Đóng chi tiết bài viết"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {images.length > 0 && (
            <section className="bg-gradient-to-br from-green-50/60 to-white p-3 sm:p-4">
              <ImageCarousel images={images} alt={post.title} className="aspect-video" />
            </section>
          )}

          <CardContent className="space-y-7 p-4 sm:space-y-8 sm:p-8">
            <header className="space-y-5">
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-700" />
                  <span>{authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-700" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-700" />
                  <span>{commentCount} bình luận</span>
                </div>
                <RatingSummary value={post.avgRating} />
              </div>
            </header>

            <article
              className="prose prose-green max-w-none text-foreground prose-headings:text-foreground prose-p:leading-8 prose-a:text-green-700"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />

            <section className="space-y-5 border-t border-green-100 pt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">Bình luận</h2>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  {commentCount}
                </Badge>
              </div>

              {isAuthenticated && user ? (
                <form onSubmit={handleSubmitComment} className="rounded-lg border border-green-100 bg-green-50/40 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-green-100">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-white">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user.fullName}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <RatingStars rating={rating} onChange={setRating} />
                        <span className="text-xs font-medium text-green-700">{rating} sao</span>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn..."
                    className="min-h-28 border-green-200 bg-white focus-visible:ring-green-500/30"
                  />
                  {submitError && <p className="mt-2 text-sm text-destructive">{submitError}</p>}
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitting || !content.trim()}
                      className="bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? "Đang gửi..." : "Gửi bình luận"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-lg border border-green-100 bg-green-50/50 p-4 text-sm text-green-800">
                  Đăng nhập để thêm bình luận mới.
                </div>
              )}

              <div className="space-y-4">
                {commentsLoading && (
                  <div className="rounded-lg border border-green-100 bg-green-50/40 py-6 text-center text-sm text-green-700">
                    Đang tải bình luận...
                  </div>
                )}

                {commentsError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 py-4 text-center text-sm text-destructive">
                    Không thể tải bình luận: {commentsError}
                  </div>
                )}

                {!commentsLoading && liveComments.length > 0 ? (
                  liveComments.map((comment) => {
                    const author = getCommentAuthor(comment);

                    return (
                      <motion.div
                        key={comment._id || comment.id || `${author.name}-${comment.createdAt}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-green-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-green-100">
                            <AvatarImage src={author.avatarUrl} alt={author.name} />
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {getInitials(author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{author.name}</p>
                              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                            </div>
                            <div className="mt-1">
                              <RatingStars rating={comment.rating} />
                            </div>
                            <p className="mt-3 leading-7 text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : !commentsLoading && (
                  <div className="rounded-lg border border-dashed border-green-200 py-10 text-center text-muted-foreground">
                    Chưa có bình luận nào cho bài viết này.
                  </div>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitReport} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Báo cáo bài viết</DialogTitle>
              <DialogDescription>
                Chọn lý do phù hợp để Plantify xem xét bài viết này.
              </DialogDescription>
            </DialogHeader>

            <RadioGroup value={reportReason} onValueChange={setReportReason} className="gap-3">
              {REPORT_REASONS.map((reason) => (
                <Label
                  key={reason.value}
                  htmlFor={`report-${reason.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-green-100 p-3 text-sm hover:bg-green-50"
                >
                  <RadioGroupItem id={`report-${reason.value}`} value={reason.value} />
                  <span>{reason.label}</span>
                </Label>
              ))}
            </RadioGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReportDialogOpen(false)} disabled={reporting}>
                Hủy
              </Button>
              <Button type="submit" disabled={reporting || !reportReason}>
                {reporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
                Gửi báo cáo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export { BlogPostDetail, BlogPostDetailError, BlogPostDetailSkeleton };
export default BlogPostDetail;
