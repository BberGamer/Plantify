// ProductForm.jsx - Form tạo/sửa sản phẩm
import { useEffect, useState } from "react";








import { ProductFormDialog } from "@/features/products/components/product-form/ProductFormDialog";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  images: [],
  description: "",
  usageGuide: "",
  price: "",
  stock: "",
  tags: "",
};

const toCommaArray = (value) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const toCommaString = (value) => (Array.isArray(value) ? value.join(", ") : "");

/**
 * ProductForm - Form tạo/sửa sản phẩm
 * @param {Object} props
 * @param {Array} props.categories
 * @param {function} props.onSubmit
 * @param {boolean} props.loading
 * @param {Object} [props.editProduct]
 */
export function ProductForm({ categories, onSubmit, loading, editProduct }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const isEditMode = !!editProduct;

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || "",
        categoryId: editProduct.categoryId?._id || editProduct.categoryId || "",
        images: Array.isArray(editProduct.images) ? editProduct.images : [],
        description: editProduct.description || "",
        usageGuide: editProduct.usageGuide || "",
        price: editProduct.price ?? "",
        stock: editProduct.stock ?? "",
        tags: toCommaString(editProduct.tags),
      });
      setIsOpen(true);
    }
  }, [editProduct]);

  const handleClose = () => {
    setIsOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...(isEditMode && { id: editProduct._id || editProduct.id }),
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      images: formData.images,
      description: formData.description.trim(),
      usageGuide: formData.usageGuide.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock || 0),
      tags: toCommaArray(formData.tags),
    };

    await onSubmit(payload);
    handleClose();
  };

  const dialogTitle = isEditMode ? "Sửa sản phẩm" : "Tạo sản phẩm mới";
  const dialogDescription = isEditMode
    ? "Cập nhật thông tin sản phẩm hiện có trong hệ thống."
    : "Nhập thông tin để tạo sản phẩm mới.";
  const submitLabel = isEditMode ? "Lưu" : "Tạo mới";

  return (
    <ProductFormDialog
      categories={categories}
      dialogDescription={dialogDescription}
      dialogTitle={dialogTitle}
      formData={formData}
      handleChange={handleChange}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      isEditMode={isEditMode}
      isOpen={isOpen}
      loading={loading}
      setIsOpen={setIsOpen}
      submitLabel={submitLabel}
    />
  );
}
