/**
 * ProductReviews.jsx - Section danh gia va binh luan san pham.
 * UI tuong tu BlogPostDetail, dung useProductComments hook.
 */
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useProductComments } from "@/features/comments/hooks";
import { ProductReviewForm } from "@/components/common/product-reviews/ProductReviewForm";
import { ProductReviewList } from "@/components/common/product-reviews/ProductReviewList";

function ProductReviews({
  productId,
  ratingAverage = 0,
  ratingCount = 0,
  onRatingUpdate,
}) {
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

  const liveAverage = comments.length > 0
    ? Number(
      (
        comments
          .filter((comment) => Number(comment.rating) > 0)
          .reduce((sum, comment) => sum + Number(comment.rating || 0), 0)
        / (comments.filter((comment) => Number(comment.rating) > 0).length || 1)
      ).toFixed(1)
    )
    : ratingAverage;
  const liveCount = comments.length || ratingCount;

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setSubmitError("Vui lòng nhập nội dung đánh giá");
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
        error.response?.data?.message
          || error.message
          || "Không thể gửi đánh giá"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Đánh giá & Nhận xét</h2>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          {liveCount} đánh giá
        </span>
      </div>

      <ProductReviewForm
        content={content}
        isAuthenticated={isAuthenticated}
        onContentChange={setContent}
        onRatingChange={setRating}
        onSubmit={handleSubmit}
        rating={rating}
        submitError={submitError}
        submitting={submitting}
        user={user}
      />

      <ProductReviewList
        comments={comments}
        error={commentsError}
        loading={commentsLoading}
      />
    </section>
  );
}

export { ProductReviews };
export default ProductReviews;
