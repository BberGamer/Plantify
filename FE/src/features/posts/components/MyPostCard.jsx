import { Calendar, Edit3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối"
};

const statusVariants = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive"
};

function formatDate(value) {
  if (!value) return "Chưa có ngày";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function MyPostCard({ post, deleting = false, onDelete, onEdit }) {
  const cover = post.images?.[0] || "";

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[180px_1fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-muted">
          <ImageWithFallback src={cover} alt={post.title} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{post.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={statusVariants[post.status] || "outline"}>
                  {statusLabels[post.status] || post.status || "Chưa rõ"}
                </Badge>
                {post.category && <Badge variant="outline">{post.category}</Badge>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => onEdit(post)}>
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Sửa bài viết</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive"
                disabled={deleting}
                onClick={() => onDelete(post)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Xóa bài viết</span>
              </Button>
            </div>
          </div>

          <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.updatedAt || post.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { MyPostCard };
