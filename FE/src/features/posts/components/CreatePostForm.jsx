import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  title: "",
  category: "",
  thumbnail: "",
  imagesText: "",
  tagsText: "",
  content: ""
};

function toCommaText(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function splitCommaText(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function CreatePostForm({ initialPost = null, loading = false, onCancel, onSubmit }) {
  const initialValues = useMemo(
    () =>
      initialPost
        ? {
            title: initialPost.title || "",
            category: initialPost.category || "",
            thumbnail: initialPost.thumbnail || "",
            imagesText: toCommaText(initialPost.images),
            tagsText: toCommaText(initialPost.tags),
            content: initialPost.content || ""
          }
        : emptyForm,
    [initialPost]
  );
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      title: formData.title,
      category: formData.category,
      thumbnail: formData.thumbnail,
      images: splitCommaText(formData.imagesText),
      tags: splitCommaText(formData.tagsText),
      content: formData.content
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="post-title">Tiêu đề</Label>
          <Input
            id="post-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Tên bài viết"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-category">Danh mục</Label>
          <Input
            id="post-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ví dụ: Chăm sóc cây"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-thumbnail">Ảnh đại diện</Label>
        <Input
          id="post-thumbnail"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="post-images">Ảnh bổ sung</Label>
          <Input
            id="post-images"
            name="imagesText"
            value={formData.imagesText}
            onChange={handleChange}
            placeholder="Mỗi URL cách nhau bằng dấu phẩy"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-tags">Tags</Label>
          <Input
            id="post-tags"
            name="tagsText"
            value={formData.tagsText}
            onChange={handleChange}
            placeholder="monstera, tưới nước, ánh sáng"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-content">Nội dung</Label>
        <Textarea
          id="post-content"
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
