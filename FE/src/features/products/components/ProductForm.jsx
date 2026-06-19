// ProductForm.jsx - Form tạo/sửa sản phẩm
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  brand: "",
  price: "",
  stock: "",
  thumbnail: "",
  images: "",
  description: "",
  tags: "",
  isActive: true,
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
        brand: editProduct.brand || "",
        price: editProduct.price ?? "",
        stock: editProduct.stock ?? "",
        thumbnail: editProduct.thumbnail || "",
        images: toCommaString(editProduct.images),
        description: editProduct.description || "",
        tags: toCommaString(editProduct.tags),
        isActive: editProduct.isActive ?? true,
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
      brand: formData.brand.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock || 0),
      thumbnail: formData.thumbnail.trim(),
      images: toCommaArray(formData.images),
      description: formData.description.trim(),
      tags: toCommaArray(formData.tags),
      isActive: formData.isActive,
    };

    await onSubmit(payload);
    handleClose();
  };

  if (!isEditMode) {
    return (
      <>
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mới
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo sản phẩm mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="productName">Tên sản phẩm *</Label>
                  <Input
                    id="productName"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="VD: Phân bón hữu cơ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Danh mục *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
                    <SelectTrigger id="productCategory">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id || category.id} value={category._id || category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="productBrand">Thương hiệu</Label>
                  <Input
                    id="productBrand"
                    value={formData.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    placeholder="VD: Plantify"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productPrice">Giá *</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="VD: 120000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productStock">Tồn kho</Label>
                  <Input
                    id="productStock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    placeholder="VD: 20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productThumbnail">Thumbnail</Label>
                <Input
                  id="productThumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => handleChange("thumbnail", e.target.value)}
                  placeholder="Nhập URL ảnh đại diện"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productImages">Danh sách ảnh</Label>
                <Input
                  id="productImages"
                  value={formData.images}
                  onChange={(e) => handleChange("images", e.target.value)}
                  placeholder="Nhập nhiều URL, ngăn cách bằng dấu phẩy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productTags">Tags</Label>
                <Input
                  id="productTags"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="VD: chăm sóc cây, phân bón, hữu cơ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">Mô tả</Label>
                <Textarea
                  id="productDescription"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Nhập mô tả sản phẩm"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="productActive"
                  checked={formData.isActive}
                  onCheckedChange={(value) => handleChange("isActive", value === true)}
                />
                <Label htmlFor="productActive" className="cursor-pointer">
                  Hiển thị sản phẩm
                </Label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo mới
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sửa sản phẩm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productName">Tên sản phẩm *</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="VD: Phân bón hữu cơ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCategory">Danh mục *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
                <SelectTrigger id="productCategory">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="productBrand">Thương hiệu</Label>
              <Input
                id="productBrand"
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                placeholder="VD: Plantify"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productPrice">Giá *</Label>
              <Input
                id="productPrice"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="VD: 120000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productStock">Tồn kho</Label>
              <Input
                id="productStock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="VD: 20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productThumbnail">Thumbnail</Label>
            <Input
              id="productThumbnail"
              value={formData.thumbnail}
              onChange={(e) => handleChange("thumbnail", e.target.value)}
              placeholder="Nhập URL ảnh đại diện"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productImages">Danh sách ảnh</Label>
            <Input
              id="productImages"
              value={formData.images}
              onChange={(e) => handleChange("images", e.target.value)}
              placeholder="Nhập nhiều URL, ngăn cách bằng dấu phẩy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productTags">Tags</Label>
            <Input
              id="productTags"
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="VD: chăm sóc cây, phân bón, hữu cơ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productDescription">Mô tả</Label>
            <Textarea
              id="productDescription"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Nhập mô tả sản phẩm"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="productActive"
              checked={formData.isActive}
              onCheckedChange={(value) => handleChange("isActive", value === true)}
            />
            <Label htmlFor="productActive" className="cursor-pointer">
              Hiển thị sản phẩm
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
