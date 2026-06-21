import { useEffect, useId, useMemo, useState } from "react";
import { Loader2, Save, Upload, X } from "lucide-react";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  title: "",
  category: "",
  content: ""
};

function CreatePostForm({ initialPost = null, loading = false, onCancel, onSubmit }) {
  const formId = useId();
  const fieldIds = {
    title: `${formId}-post-title`,
    category: `${formId}-post-category`,
    images: `${formId}-post-images`,
    content: `${formId}-post-content`
  };
  const existingImages = useMemo(() => {
    if (!initialPost) {
      return [];
    }

    return Array.from(new Set([initialPost.thumbnail, ...(initialPost.images || [])].filter(Boolean)));
  }, [initialPost]);
  const initialValues = useMemo(
    () =>
      initialPost
        ? {
            title: initialPost.title || "",
            category: initialPost.category || "",
            content: initialPost.content || ""
          }
        : emptyForm,
    [initialPost]
  );
  const [formData, setFormData] = useState(initialValues);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    setFormData(initialValues);
    setImageFiles([]);
  }, [initialValues]);

  useEffect(() => {
    const previews = imageFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imageFiles]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event) => {
    setImageFiles(Array.from(event.target.files || []));
  };

  const handleClearImages = () => {
    setImageFiles([]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("category", formData.category);
    payload.append("content", formData.content);

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        payload.append("images", file);
      });
    } else if (initialPost) {
      payload.append("images", JSON.stringify(initialPost.images || []));
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fieldIds.title}>Tiêu đề</Label>
          <Input
            id={fieldIds.title}
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Tên bài viết"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldIds.category}>Danh mục</Label>
          <Input
            id={fieldIds.category}
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ví dụ: Chăm sóc cây"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldIds.images}>Ảnh bài viết</Label>
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
          <Input
            id={fieldIds.images}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" asChild>
              <label htmlFor={fieldIds.images} className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Chọn ảnh
              </label>
            </Button>
            {imageFiles.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClearImages}>
                <X className="h-4 w-4" />
                Xóa ảnh đã chọn
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {imageFiles.length ? `${imageFiles.length} ảnh đã chọn` : "Chọn một hoặc nhiều ảnh từ máy"}
            </span>
          </div>
        </div>
      </div>

      {(imagePreviews.length > 0 || existingImages.length > 0) && (
        <div className="space-y-2">
          <Label>{imagePreviews.length > 0 ? "Preview ảnh đã chọn" : "Ảnh hiện tại"}</Label>
          <ImageCarousel
            images={imagePreviews.length > 0 ? imagePreviews.map((image) => image.url) : existingImages}
            alt="Ảnh bài viết"
            className="aspect-video"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={fieldIds.content}>Nội dung</Label>
        <Textarea
          id={fieldIds.content}
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="min-h-48"
          placeholder="Chia sẻ kinh nghiệm chăm cây của bạn"
          required
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {initialPost ? "Lưu thay đổi" : "Gửi bài viết"}
        </Button>
      </div>
    </form>
  );
}

export { CreatePostForm };
