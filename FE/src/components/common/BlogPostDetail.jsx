/**
 * BlogPostDetail.jsx - Card/modal hien thi chi tiet bai viet va binh luan.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Heart,
  Image as ImageIcon,
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
import { Textarea } from "@/components/ui/textarea";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useAuth } from "@/features/auth/hooks";
import { useComments } from "@/features/comments/hooks";

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
  const name = author.fullName || author.name || comment.fullName || comment.name || "Nguoi dung Plantify";

  return {
    name,
    avatarUrl: author.avatarUrl || comment.avatarUrl || "",
  };
}

/**
 * Render rating bang icon sao de giu UI gon va de scan.
 * @param {number} rating - Diem danh gia 1-5
 * @returns {JSX.Element|null} Cum sao rating
 */
function RatingStars({ rating }) {
  const safeRating = Math.max(0, Math.min(Number(rating) || 0, 5));

  if (!safeRating) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${safeRating}/5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < safeRating ? "fill-current" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
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
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!post) {
    return null;
  }

  const authorName = post.author?.fullName || post.author?.name || post.author || "Plantify";
  const likesCount = post.likesCount || post.likes || 0;
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
      setSubmitError("Vui long nhap noi dung binh luan");
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
      setSubmitError(error.response?.data?.message || error.message || "Khong the gui binh luan");
    } finally {
      setSubmitting(false);
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
                <span className="hidden sm:inline">Quay lai</span>
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
              className="shrink-0 rounded-full hover:bg-green-50 hover:text-green-700"
              onClick={onClose}
              aria-label="Dong chi tiet bai viet"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {images.length > 0 && (
            <section className="grid gap-3 bg-gradient-to-br from-green-50/60 to-white p-3 sm:p-4 md:grid-cols-[1.5fr_1fr]">
              <div className="aspect-video overflow-hidden rounded-lg border border-green-100 bg-white">
                <ImageWithFallback
                  src={images[0]}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {images.slice(1, 5).map((image, index) => (
                  <div key={image} className="aspect-video overflow-hidden rounded-lg border border-green-100 bg-white">
                    <ImageWithFallback
                      src={image}
                      alt={`${post.title} ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {images.length === 1 && (
                  <div className="col-span-2 flex aspect-video items-center justify-center rounded-lg border border-dashed border-green-200 bg-white/70 text-green-700">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
            </section>
          )}

          <CardContent className="space-y-7 p-4 sm:space-y-8 sm:p-8">
            <header className="space-y-5">
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
              )}
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
                  <Heart className="h-4 w-4 text-green-700" />
                  <span>{likesCount} luot thich</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-700" />
                  <span>{commentCount} binh luan</span>
                </div>
              </div>
            </header>

            <article
              className="prose prose-green max-w-none text-foreground prose-headings:text-foreground prose-p:leading-8 prose-a:text-green-700"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />

            <section className="space-y-5 border-t border-green-100 pt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">Binh luan</h2>
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
                        <RatingStars rating={rating} />
                        <select
                          value={rating}
                          onChange={(event) => setRating(Number(event.target.value))}
                          className="rounded-md border border-green-200 bg-white px-2 py-1 text-xs text-green-700 outline-none focus:ring-2 focus:ring-green-500/30"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>
                              {value} sao
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Chia se cam nhan cua ban..."
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
                      {submitting ? "Dang gui..." : "Gui binh luan"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-lg border border-green-100 bg-green-50/50 p-4 text-sm text-green-800">
                  Dang nhap de them binh luan moi.
                </div>
              )}

              <div className="space-y-4">
                {commentsLoading && (
                  <div className="rounded-lg border border-green-100 bg-green-50/40 py-6 text-center text-sm text-green-700">
                    Dang tai binh luan...
                  </div>
                )}

                {commentsError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 py-4 text-center text-sm text-destructive">
                    Khong the tai binh luan: {commentsError}
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
                    Chua co binh luan nao cho bai viet nay.
                  </div>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export { BlogPostDetail };
export default BlogPostDetail;
