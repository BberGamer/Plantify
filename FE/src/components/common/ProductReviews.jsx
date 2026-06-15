/**
 * ProductReviews.jsx - Section danh gia va binh luan san pham.
 * UI tuong tu BlogPostDetail, dung useProductComments hook.
 */
import { useState } from "react";
import { motion } from "motion/react";
import { Send, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/hooks";
import { useProductComments } from "@/features/comments/hooks";

/**
 * Format ngay theo tieng Viet.
 * @param {string|Date} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Lay chu cai dau de hien thi avatar fallback.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/**
 * Lay thong tin tac gia tu comment.
 * @param {object} comment
 * @returns {{ name: string, avatarUrl: string }}
 */
function getCommentAuthor(comment) {
  const author = comment.userId || comment.user || comment.author || {};
  const name =
    author.fullName ||
    author.name ||
    comment.fullName ||
    comment.name ||
    "Nguoi dung Plantify";
  return {
    name,
    avatarUrl: author.avatarUrl || comment.avatarUrl || "",
  };
}

/**
 * Hien thi cum sao rating co the click de chon.
 * @param {{ rating: number, onChange?: Function }} props
 */
function RatingStars({ rating, onChange }) {
  const [hovered, setHovered] = useState(null);
  const safeRating = Math.max(0, Math.min(Number(rating) || 0, 5));
  const displayRating = hovered ?? safeRating;

  return (
    <div
      className="flex items-center gap-0.5 text-amber-500"
      aria-label={`${safeRating}/5 sao`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <button
          key={index}
          type="button"
          className={`rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            onChange ? "cursor-pointer hover:text-amber-600" : "cursor-default"
          }`}
          onClick={() => onChange?.(index + 1)}
          onMouseEnter={() => onChange && setHovered(index + 1)}
          onMouseLeave={() => onChange && setHovered(null)}
          disabled={!onChange}
          aria-label={`Chon ${index + 1} sao`}
        >
          <Star
            className={`h-4 w-4 transition-all ${
              index < displayRating
                ? "fill-current text-amber-500"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Phan tong quan rating: hien thi diem trung binh va tong so danh gia.
 * @param {{ average: number, count: number }} props
 */
function RatingSummaryBar({ average, count }) {
  const safeAvg = Math.max(0, Math.min(Number(average) || 0, 5));

  return (
    <div className="flex items-center gap-4 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50/40 p-5">
      <div className="text-center">
        <p className="text-5xl font-bold text-amber-500">{safeAvg.toFixed(1)}</p>
        <RatingStars rating={Math.round(safeAvg)} />
        <p className="mt-1 text-xs text-muted-foreground">{count} đánh giá</p>
      </div>
      <div className="flex-1">
        {[5, 4, 3, 2, 1].map((star) => {
          // Tinh ty le moi sao dua tren danh sach hien tai
          return (
            <div key={star} className="mb-1 flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{star}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <div className="h-1.5 flex-1 rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: star <= Math.round(safeAvg) ? "60%" : "10%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Section danh gia san pham: form gui danh gia + danh sach reviews.
 * @param {{ productId: string, ratingAverage: number, ratingCount: number, onRatingUpdate: Function }} props
 */
function ProductReviews({ productId, ratingAverage = 0, ratingCount = 0, onRatingUpdate }) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    submitReview,
  } = useProductComments(productId);

  // Tinh lai avgRating tu danh sach hien tai neu co
  const liveAverage =
    comments.length > 0
      ? Number(
          (
            comments
              .filter((c) => Number(c.rating) > 0)
              .reduce((sum, c) => sum + Number(c.rating || 0), 0) /
            (comments.filter((c) => Number(c.rating) > 0).length || 1)
          ).toFixed(1)
        )
      : ratingAverage;

  const liveCount = comments.length || ratingCount;

  /**
   * Gui danh gia moi len API, refetch danh sach va cap nhat rating o parent.
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setSubmitError("Vui long nhap noi dung danh gia");
      return;
    }
    if (!user || !productId) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitReview({
        userId: user._id || user.id,
        productId,
        content: trimmedContent,
        rating,
      });
      setContent("");
      setRating(5);
      onRatingUpdate?.();
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || error.message || "Khong the gui danh gia"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Đánh giá & Nhận xét</h2>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          {liveCount} đánh giá
        </span>
      </div>

      {/* Tong quan rating */}
      <RatingSummaryBar average={liveAverage} count={liveCount} />

      {/* Form gui danh gia */}
      {isAuthenticated && user ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-green-100 bg-green-50/40 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-green-100">
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-white text-sm">
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
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia se cam nhan cua ban ve san pham..."
            className="min-h-24 border-green-200 bg-white focus-visible:ring-green-500/30"
          />
          {submitError && (
            <p className="mt-2 text-sm text-destructive">{submitError}</p>
          )}
          <div className="mt-3 flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !content.trim()}
              className="bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Dang gui..." : "Gui danh gia"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 text-sm text-green-800">
          Vui long{" "}
          <a href="/login" className="font-semibold underline underline-offset-2">
            dang nhap
          </a>{" "}
          de gui danh gia san pham.
        </div>
      )}

      {/* Danh sach reviews */}
      <div className="space-y-4">
        {commentsLoading && (
          <div className="rounded-xl border border-green-100 bg-green-50/40 py-8 text-center text-sm text-green-700">
            Dang tai danh gia...
          </div>
        )}

        {commentsError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-4 text-center text-sm text-destructive">
            Khong the tai danh gia: {commentsError}
          </div>
        )}

        {!commentsLoading && comments.length > 0
          ? comments.map((comment) => {
              const author = getCommentAuthor(comment);
              return (
                <motion.div
                  key={comment._id || comment.id || `${author.name}-${comment.createdAt}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-green-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-green-100">
                      <AvatarImage src={author.avatarUrl} alt={author.name} />
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                        {getInitials(author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{author.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <RatingStars rating={comment.rating} />
                      </div>
                      <p className="mt-3 leading-7 text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          : !commentsLoading && (
              <div className="rounded-xl border border-dashed border-green-200 py-12 text-center text-muted-foreground">
                Chua co danh gia nao cho san pham nay. Hay la nguoi dau tien!
              </div>
            )}
      </div>
    </section>
  );
}

export { ProductReviews };
export default ProductReviews;
