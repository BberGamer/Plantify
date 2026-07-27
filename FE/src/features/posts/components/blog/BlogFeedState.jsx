// BlogFeedState.jsx - Hiển thị trạng thái tải, lỗi hoặc trống của bảng tin blog
import { Button } from "@/components/ui/button";

function BlogFeedState({ message, onRetry, status }) {
  if (!status) {
    return null;
  }

  if (status === "error") {
    return (
      <div className="blog-feed-state">
        <p className="mb-4 text-destructive">{message}</p>
        <Button type="button" variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`blog-feed-state ${
        status === "empty" ? "text-muted-foreground" : ""
      }`}
    >
      {message}
    </div>
  );
}

export { BlogFeedState };
