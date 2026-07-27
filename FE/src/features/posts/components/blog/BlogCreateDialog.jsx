// BlogCreateDialog.jsx - Hiển thị hộp thoại tạo bài viết mới
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function BlogCreateDialog({
  createFormKey,
  creating,
  onCreatePost,
  onOpenChange,
  open,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo bài viết mới</DialogTitle>
          <DialogDescription>
            Bài viết của bạn sẽ ở trạng thái chờ duyệt sau khi gửi.
          </DialogDescription>
        </DialogHeader>
        <CreatePostForm
          key={createFormKey}
          loading={creating}
          onCancel={() => onOpenChange(false)}
          onSubmit={onCreatePost}
        />
      </DialogContent>
    </Dialog>
  );
}

export { BlogCreateDialog };
