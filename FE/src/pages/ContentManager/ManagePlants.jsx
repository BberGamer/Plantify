// ManagePlants.jsx - Trang danh sách Plants cho Content Manager
// Hiển thị grid cards, click vào card → chuyển sang trang chi tiết /content/plants/:id
import { useState } from "react";
import { useNavigate } from "react-router";
import { usePlants, useCreatePlant, useUpdatePlant, useDeletePlant } from "@/features/plants/hooks";
import {
  Plus, Pencil, Trash2, Search, Loader2,
  Droplets, Sun, Home, Eye, ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  scientificName: "",
  categoryId: "",
  thumbnail: "",
  images: "",
  shortDescription: "",
  description: "",
  difficultyLevel: "",
  sunlight: "",
  watering: "",
  humidity: "",
  temperature: "",
  soil: "",
  origin: "",
  fertilizer: "",
  toxicity: "",
  growthRate: "",
  matureSize: "",
  propagation: "",
  pruning: "",
  repotting: "",
  tags: "",
  isIndoor: true,
  isPetFriendly: false,
  isActive: true,
};

const DIFFICULTY_COLORS = {
  "Dễ": "bg-green-100 text-green-700 border-green-200",
  "Trung bình": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Khó": "bg-red-100 text-red-700 border-red-200",
};

const toCommaString = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "");
const toCommaArray = (str) => (str ? str.split(",").map((t) => t.trim()).filter(Boolean) : []);

function ManagePlants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { plants, loading, pages, refetch } = usePlants({
    search,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    page,
    limit: 12,
  });

  const { create, loading: creating } = useCreatePlant();
  const { update, loading: updating } = useUpdatePlant();
  const { remove, loading: deleting } = useDeletePlant();

  const handleOpenCreate = () => {
    setEditingPlant(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e, plant) => {
    e.stopPropagation();
    setEditingPlant(plant);
    setFormData({
      name: plant.name || "",
      scientificName: plant.scientificName || "",
      categoryId: plant.categoryId || "",
      thumbnail: plant.thumbnail || "",
      images: toCommaString(plant.images),
      shortDescription: plant.shortDescription || "",
      description: plant.description || "",
      difficultyLevel: plant.difficultyLevel || "",
      sunlight: plant.sunlight || "",
      watering: plant.watering || "",
      humidity: plant.humidity || "",
      temperature: plant.temperature || "",
      soil: plant.soil || "",
      origin: plant.origin || "",
      fertilizer: plant.fertilizer || "",
      toxicity: plant.toxicity || "",
      growthRate: plant.growthRate || "",
      matureSize: plant.matureSize || "",
      propagation: plant.propagation || "",
      pruning: plant.pruning || "",
      repotting: plant.repotting || "",
      tags: toCommaString(plant.tags),
      isIndoor: plant.isIndoor ?? true,
      isPetFriendly: plant.isPetFriendly ?? false,
      isActive: plant.isActive ?? true,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlant(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      images: toCommaArray(formData.images),
      tags: toCommaArray(formData.tags),
    };
    try {
      if (editingPlant) {
        await update(editingPlant._id || editingPlant.id, payload);
        toast.success("Cập nhật cây thành công");
      } else {
        await create(payload);
        toast.success("Tạo cây thành công");
      }
      handleCloseForm();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (e, plant) => {
    e.stopPropagation();
    if (!confirm(`Xóa cây "${plant.name}"?`)) return;
    try {
      await remove(plant._id || plant.id);
      toast.success("Xóa cây thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleCardClick = (plant) => {
    navigate(`/content/plants/${plant._id || plant.id}`);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isSubmitting = creating || updating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Plants</h1>
          <p className="text-sm text-muted-foreground">
            Nhấn vào card để xem chi tiết cây
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cây..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="easy-care">Cây dễ chăm</SelectItem>
                <SelectItem value="indoor">Cây trong nhà</SelectItem>
                <SelectItem value="outdoor">Cây ngoài trời</SelectItem>
                <SelectItem value="succulent">Cây sen đá</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plant Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plants.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-muted-foreground">Chưa có cây nào. Nhấn "Tạo mới" để thêm.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plants.map((plant) => (
            <Card
              key={plant._id || plant.id}
              className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card"
              onClick={() => handleCardClick(plant)}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <ImageWithFallback
                  src={plant.thumbnail || plant.images?.[0]}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  fallback={<ImageIcon className="w-12 h-12 text-muted-foreground" />}
                />
                <div className="absolute top-3 left-3">
                  <Badge className={DIFFICULTY_COLORS[plant.difficultyLevel] + " backdrop-blur-sm"}>
                    {plant.difficultyLevel || "—"}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 truncate">{plant.name}</h3>
                <p className="text-xs text-muted-foreground italic mb-3 truncate">
                  {plant.scientificName || ""}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {plant.watering && (
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-primary" />
                        <span>{plant.watering}</span>
                      </div>
                    )}
                    {plant.sunlight && (
                      <div className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-primary" />
                        <span>{plant.sunlight}</span>
                      </div>
                    )}
                    {plant.isIndoor && <Home className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleOpenEdit(e, plant)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(e, plant)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
          <span className="text-sm text-muted-foreground">Trang {page} / {pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Sau</Button>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlant ? "Chỉnh sửa cây" : "Tạo cây mới"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên cây *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="VD: Monstera Deliciosa" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scientificName">Tên khoa học</Label>
                <Input id="scientificName" value={formData.scientificName} onChange={(e) => handleInputChange("scientificName", e.target.value)} placeholder="VD: Monstera deliciosa" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select value={formData.categoryId} onValueChange={(v) => handleInputChange("categoryId", v)}>
                  <SelectTrigger id="categoryId"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy-care">Cây dễ chăm</SelectItem>
                    <SelectItem value="indoor">Cây trong nhà</SelectItem>
                    <SelectItem value="outdoor">Cây ngoài trời</SelectItem>
                    <SelectItem value="succulent">Cây sen đá</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Độ khó</Label>
                <Select value={formData.difficultyLevel} onValueChange={(v) => handleInputChange("difficultyLevel", v)}>
                  <SelectTrigger id="difficultyLevel"><SelectValue placeholder="Chọn độ khó" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dễ">Dễ</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Khó">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Ảnh đại diện (URL)</Label>
              <Input id="thumbnail" value={formData.thumbnail} onChange={(e) => handleInputChange("thumbnail", e.target.value)} placeholder="https://..." />
              {formData.thumbnail && (
                <img src={formData.thumbnail} alt="preview" className="mt-2 h-24 w-auto rounded-md object-cover" onError={(e) => e.target.style.display = "none"} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Danh sách ảnh (phân cách bằng dấu phẩy)</Label>
              <Textarea id="images" value={formData.images} onChange={(e) => handleInputChange("images", e.target.value)} placeholder="https://..., https://..." rows={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Mô tả ngắn</Label>
              <Input id="shortDescription" value={formData.shortDescription} onChange={(e) => handleInputChange("shortDescription", e.target.value)} placeholder="Một câu mô tả ngắn" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Nhập mô tả chi tiết..." rows={4} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sunlight">Ánh sáng</Label>
                <Input id="sunlight" value={formData.sunlight} onChange={(e) => handleInputChange("sunlight", e.target.value)} placeholder="VD: Ánh sáng gián tiếp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="watering">Tưới nước</Label>
                <Input id="watering" value={formData.watering} onChange={(e) => handleInputChange("watering", e.target.value)} placeholder="VD: 1-2 lần/tuần" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Độ ẩm</Label>
                <Input id="humidity" value={formData.humidity} onChange={(e) => handleInputChange("humidity", e.target.value)} placeholder="VD: 60-80%" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperature">Nhiệt độ</Label>
                <Input id="temperature" value={formData.temperature} onChange={(e) => handleInputChange("temperature", e.target.value)} placeholder="VD: 18-30°C" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil">Loại đất</Label>
                <Input id="soil" value={formData.soil} onChange={(e) => handleInputChange("soil", e.target.value)} placeholder="VD: Đất thoát nước tốt" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Nguồn gốc</Label>
                <Input id="origin" value={formData.origin} onChange={(e) => handleInputChange("origin", e.target.value)} placeholder="VD: Châu Mỹ nhiệt đới" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fertilizer">Phân bón</Label>
                <Input id="fertilizer" value={formData.fertilizer} onChange={(e) => handleInputChange("fertilizer", e.target.value)} placeholder="VD: Bón 2 tháng/lần" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toxicity">Độc tính</Label>
                <Input id="toxicity" value={formData.toxicity} onChange={(e) => handleInputChange("toxicity", e.target.value)} placeholder="VD: An toàn cho pet" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="growthRate">Tốc độ tăng trưởng</Label>
                <Input id="growthRate" value={formData.growthRate} onChange={(e) => handleInputChange("growthRate", e.target.value)} placeholder="VD: Nhanh" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="matureSize">Kích thước trưởng thành</Label>
                <Input id="matureSize" value={formData.matureSize} onChange={(e) => handleInputChange("matureSize", e.target.value)} placeholder="VD: 50-100cm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propagation">Nhân giống</Label>
                <Input id="propagation" value={formData.propagation} onChange={(e) => handleInputChange("propagation", e.target.value)} placeholder="VD: Giâm lá, tách bụi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pruning">Cắt tỉa</Label>
                <Input id="pruning" value={formData.pruning} onChange={(e) => handleInputChange("pruning", e.target.value)} placeholder="VD: Cắt lá hư" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repotting">Thay chậu</Label>
              <Input id="repotting" value={formData.repotting} onChange={(e) => handleInputChange("repotting", e.target.value)} placeholder="VD: Thay chậu mỗi năm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input id="tags" value={formData.tags} onChange={(e) => handleInputChange("tags", e.target.value)} placeholder="VD: cây cảnh, trong nhà, dễ trồng" />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="isIndoor" checked={formData.isIndoor} onCheckedChange={(v) => handleInputChange("isIndoor", v)} />
                <Label htmlFor="isIndoor" className="cursor-pointer">Cây trong nhà</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isPetFriendly" checked={formData.isPetFriendly} onCheckedChange={(v) => handleInputChange("isPetFriendly", v)} />
                <Label htmlFor="isPetFriendly" className="cursor-pointer">An toàn cho pet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(v) => handleInputChange("isActive", v)} />
                <Label htmlFor="isActive" className="cursor-pointer">Hiển thị</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPlant ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { ManagePlants };
