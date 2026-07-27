import { useEffect, useId, useMemo, useState } from "react";







import { CreatePostFields } from "@/features/posts/components/create-post/CreatePostFields";

const POST_CATEGORIES = [
  "Hướng dẫn",
  "Bệnh & Điều trị",
  "Phòng ngừa",
  "Chăm sóc",
  "Thiết kế",
  "Kĩ thuật",
];

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
  const initialExistingImages = useMemo(() => {
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
  const [existingImages, setExistingImages] = useState(initialExistingImages);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    setFormData(initialValues);
    setExistingImages(initialExistingImages);
    setImageFiles([]);
  }, [initialExistingImages, initialValues]);

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

  const handleRemoveExistingImage = (index) => {
    setExistingImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
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
      payload.append("images", JSON.stringify(existingImages));
      payload.append("thumbnail", existingImages[0] || "");
    }

    onSubmit(payload);
  };

  return (
    <CreatePostFields
      POST_CATEGORIES={POST_CATEGORIES}
      existingImages={existingImages}
      fieldIds={fieldIds}
      formData={formData}
      handleChange={handleChange}
      handleClearImages={handleClearImages}
      handleImageChange={handleImageChange}
      handleRemoveExistingImage={handleRemoveExistingImage}
      handleSubmit={handleSubmit}
      imageFiles={imageFiles}
      imagePreviews={imagePreviews}
      initialPost={initialPost}
      loading={loading}
      onCancel={onCancel}
      setFormData={setFormData}
    />
  );
}

export { CreatePostForm };
