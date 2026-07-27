import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductRatingStars } from "./ProductRatingStars";

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function getCommentAuthor(comment) {
  const author = comment.userId || comment.user || comment.author || {};
  return {
    name: author.fullName
      || author.name
      || comment.fullName
      || comment.name
      || "Người dùng Plantify",
    avatarUrl: author.avatarUrl || comment.avatarUrl || "",
  };
}

function ProductReviewList({ comments, error, loading }) {
  return (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-xl border border-green-100 bg-green-50/40 py-8 text-center text-sm text-green-700">
          Đang tải đánh giá...
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-4 text-center text-sm text-destructive">
          Không thể tải đánh giá: {error}
        </div>
      )}
      {!loading && comments.length > 0
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
                  <AvatarFallback className="bg-green-100 text-sm text-green-700">
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
                    <ProductRatingStars rating={comment.rating} />
                  </div>
                  <p className="mt-3 leading-7 text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            </motion.div>
          );
        })
        : !loading && (
          <div className="rounded-xl border border-dashed border-green-200 py-12 text-center text-muted-foreground">
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!
          </div>
        )}
    </div>
  );
}

export { ProductReviewList };
