import { FileText, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MyPostCard } from "./MyPostCard";

function MyPostsList({ deletingId, error, loading, onDelete, onEdit, onRefetch, posts }) {
  if (loading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-4 p-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" variant="outline" onClick={onRefetch}>
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </Button>
      </Card>
    );
  }

  if (!posts.length) {
    return (
      <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Bạn chưa có bài viết nào</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Tạo bài viết đầu tiên để chia sẻ kinh nghiệm chăm cây với cộng đồng Plantify.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <MyPostCard
          key={post._id || post.id}
          post={post}
          deleting={deletingId === (post._id || post.id)}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export { MyPostsList };
