// BlogCommentsSection.jsx - Hiển thị danh sách và biểu mẫu bình luận trong chi tiết bài viết
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Star } from "lucide-react";

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function getCommentAuthor(comment) {
  const author = comment?.userId || comment?.author || {};
  return {
    name: author.fullName || author.name || "Người dùng Plantify",
    avatarUrl: author.avatarUrl || author.avatar || "",
  };
}

function RatingStars({ rating, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(value)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`h-4 w-4 ${
              value <= Number(rating || 0)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function BlogCommentsSection({
  commentCount,
  commentsError,
  commentsLoading,
  content,
  isAuthenticated,
  liveComments,
  onContentChange,
  onRatingChange,
  onSubmit,
  rating,
  submitError,
  submitting,
  user,
}) {
  return (
    <section className="space-y-5 border-t border-green-100 pt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Bình luận</h2>
        <Badge variant="secondary" className="bg-green-50 text-green-700">
          {commentCount}
        </Badge>
      </div>

      {isAuthenticated && user ? (
        <form
          onSubmit={onSubmit}
          className="rounded-lg border border-green-100 bg-green-50/40 p-4"
        >
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
                <RatingStars rating={rating} onChange={onRatingChange} />
                <span className="text-xs font-medium text-green-700">{rating} sao</span>
              </div>
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
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
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1"><RatingStars rating={comment.rating} /></div>
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
  );
}

export { BlogCommentsSection };
