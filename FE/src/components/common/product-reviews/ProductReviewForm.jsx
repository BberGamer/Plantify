// ProductReviewForm.jsx - Cung cấp biểu mẫu gửi đánh giá và bình luận sản phẩm
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ProductRatingStars } from "./ProductRatingStars";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function ProductReviewForm({
  content,
  isAuthenticated,
  onContentChange,
  onRatingChange,
  onSubmit,
  rating,
  submitError,
  submitting,
  user,
}) {
  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 text-sm text-green-800">
        Vui lòng{" "}
        <a href="/login" className="font-semibold underline underline-offset-2">
          đăng nhập
        </a>{" "}
        để gửi đánh giá sản phẩm.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-green-100 bg-green-50/40 p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-green-100">
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-sm text-white">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{user.fullName}</p>
          <div className="mt-1 flex items-center gap-2">
            <ProductRatingStars rating={rating} onChange={onRatingChange} />
            <span className="text-xs font-medium text-green-700">{rating} sao</span>
          </div>
        </div>
      </div>
      <Textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm.."
        className="min-h-24 border-green-200 bg-white focus-visible:ring-green-500/30"
      />
      {submitError && <p className="mt-2 text-sm text-destructive">{submitError}</p>}
      <div className="mt-3 flex justify-end">
        <Button
          type="submit"
          disabled={submitting || !content.trim()}
          className="bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700"
        >
          <Send className="mr-2 h-4 w-4" />
          {submitting ? "Dang gui..." : "Gửi đánh giá"}
        </Button>
      </div>
    </form>
  );
}

export { ProductReviewForm };
