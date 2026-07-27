import {
  ArrowLeft,
  Calendar,
  Flag,
  MessageCircle,
  Star,
  User,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function RatingStars({ rating, onChange }) {
  const safeRating = Math.max(0, Math.min(Number(rating) || 0, 5));

  if (!safeRating && !onChange) {
    return null;
  }

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
          disabled={!onChange}
          aria-label={`Chọn ${index + 1} sao`}
        >
          <Star
            className={`h-4 w-4 ${
              index < safeRating ? "fill-current" : "text-muted-foreground/30"
            }`}
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

function BlogPostModalHeader({
  category,
  isOwnPost,
  onClose,
  onOpenReport,
  postDate,
}) {
  return (
    <div
      className="
        sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-green-100
        bg-white/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4
      "
    >
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
          {category || "Blog"}
        </Badge>
        <span className="truncate text-sm text-muted-foreground">{postDate}</span>
      </div>
      {!isOwnPost && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full hover:bg-amber-50 hover:text-amber-700"
          onClick={onOpenReport}
          aria-label="Báo cáo bài viết"
        >
          <Flag className="h-5 w-5" />
        </Button>
      )}
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
  );
}

function BlogPostArticleContent({
  authorName,
  averageRating,
  commentCount,
  content,
  postDate,
  title,
}) {
  return (
    <>
      <header className="space-y-5">
        <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-700" />
            <span>{authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-700" />
            <span>{postDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-700" />
            <span>{commentCount} bình luận</span>
          </div>
          <RatingSummary value={averageRating} />
        </div>
      </header>

      <article
        className="prose prose-green max-w-none text-foreground prose-headings:text-foreground prose-p:leading-8 prose-a:text-green-700"
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
    </>
  );
}

export { BlogPostArticleContent, BlogPostModalHeader };
