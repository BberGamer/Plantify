import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { motion } from "motion/react";

function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: ""
  });
  const [images, setImages] = useState([]);

  const categories = [
    "Phân bón",
    "Dụng cụ",
    "Đất & Giá thể",
    "Chậu & Giá đỡ",
    "Thuốc bảo vệ",
    "Hệ thống tưới"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(
        (file) => URL.createObjectURL(file)
      );
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Thêm sản phẩm mới</h1>
          <p className="text-muted-foreground">Điền thông tin để thêm sản phẩm vào gian hàng của bạn</p>
        </motion.div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-1">Tải ảnh lên</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG tối đa 5MB</p>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="VD: Phân bón hữu cơ NPK cao cấp"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Danh mục <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="0"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">
                        Số lượng <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        placeholder="0"
                        value={formData.stock}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả sản phẩm</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      rows={8}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 justify-end"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/my-shop")}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-primary to-green-600"
              >
                Thêm sản phẩm
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

export { AddProduct };
