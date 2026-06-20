import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import { MyPostsList } from "@/features/posts/components/MyPostsList";
import {
  useCreatePost,
  useDeletePost,
  useMyPosts,
  useUpdatePost
} from "@/features/posts/hooks";
import { useAuth } from "@/features/auth/hooks";

function MyPosts() {
  const { isAuthenticated, user } = useAuth();
  const { posts, loading, error, refetch } = useMyPosts();
  const { create, loading: creating } = useCreatePost();
  const { update, loading: updating } = useUpdatePost();
  const { remove, loading: deleting } = useDeletePost();
  const [editingPost, setEditingPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formKey, setFormKey] = useState(0);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role && user.role !== "customer") {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleCreate = async (payload) => {
    try {
      await create(payload);
      toast.success("Bài viết đã được gửi và đang chờ duyệt");
      setFormKey((current) => current + 1);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tạo bài viết");
    }
  };

  const handleUpdate = async (payload) => {
    const id = editingPost?._id || editingPost?.id;
    try {
      await update(id, payload);
      toast.success("Bài viết đã được cập nhật và đang chờ duyệt");
      setEditingPost(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể cập nhật bài viết");
    }
  };

  const handleDelete = async (post) => {
    const id = post._id || post.id;

    if (!confirm(`Xóa bài viết "${post.title}"?`)) return;

    setDeletingId(id);
    try {
      await remove(id);
      toast.success("Đã xóa bài viết");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xóa bài viết");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bài viết của tôi</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tạo, chỉnh sửa và theo dõi trạng thái duyệt bài viết của bạn.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={refetch}>
            Tải lại
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <PenSquare className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Tạo bài viết mới</CardTitle>
                <CardDescription>
                  Bài viết của bạn sẽ ở trạng thái chờ duyệt sau khi gửi.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CreatePostForm key={formKey} loading={creating} onSubmit={handleCreate} />
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Danh sách bài viết</h2>
            <p className="text-sm text-muted-foreground">
              Bạn có thể sửa hoặc xóa các bài viết do chính mình tạo.
            </p>
          </div>
          <MyPostsList
            deletingId={deleting ? deletingId : null}
            error={error}
            loading={loading}
            posts={posts}
            onDelete={handleDelete}
            onEdit={setEditingPost}
            onRefetch={refetch}
          />
        </section>
      </div>

      <Dialog open={Boolean(editingPost)} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sửa bài viết</DialogTitle>
            <DialogDescription>
              Sau khi lưu, bài viết sẽ quay lại trạng thái chờ duyệt.
            </DialogDescription>
          </DialogHeader>
          {editingPost && (
            <CreatePostForm
              initialPost={editingPost}
              loading={updating}
              onCancel={() => setEditingPost(null)}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { MyPosts };
