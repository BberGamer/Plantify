// ManagePlants.jsx - Trang danh sách Plants cho Content Manager
// Hiển thị grid cards, click vào card → chuyển sang trang chi tiết /content/plants/:id
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  usePlants, useCreatePlant, useDeletePlant,
  usePlantCategories, useCreateCategory, useDeleteCategory
} from "@/features/plants/hooks";
import {
  Plus, Trash2, Search, Loader2,
  Droplets, Sun, Home, Eye, ImageIcon, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  scientificName: "",
  categoryId: "",
  images: "",
  shortDescription: "",
  description: "",
  difficultyLevel: "",
  sunlight: "",
  humidity: "",
  temperatureMin: "",
  temperatureMax: "",
  origin: "",
  tags: "",
  soil: "",
  toxicity: false,
};

const DIFFICULTY_COLORS = {
  "Dễ": "bg-green-100 text-green-700 border-green-200",
  "Trung bình": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Khó": "bg-red-100 text-red-700 border-red-200",
};

const toCommaString = (arr) =>
  Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "";
const toCommaArray = (str) =>
  str ? str.split(",").map((t) => t.trim()).filter(Boolean) : [];

// ─── Plants Tab ───────────────────────────────────────────────────────────────

function PlantsTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { plants, loading, pages, refetch } = usePlants({
    search,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    page,
    limit: 12,
  });

  const { categories } = usePlantCategories();
  const { create, loading: creating } = useCreatePlant();
  const { remove, loading: deleting } = useDeletePlant();

  const handleOpenCreate = () => {
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      images: toCommaArray(formData.images),
      tags: toCommaArray(formData.tags),
      temperatureMin: formData.temperatureMin !== "" ? Number(formData.temperatureMin) : undefined,
      temperatureMax: formData.temperatureMax !== "" ? Number(formData.temperatureMax) : undefined,
    };
    try {
      await create(payload);
      toast.success("Tạo cây thành công");
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

  const isSubmitting = creating || deleting;

  return (
    <>
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Danh sách Plants</h2>
          <p className="text-sm text-muted-foreground">Nhấn vào card để xem chi tiết</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mới
        </Button>
      </div>

      <Card className="mb-6">
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
                {categories.map((cat) => (
                  <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
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
                  src={plant.images?.[0]}
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
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => handleDelete(e, plant)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
          <span className="text-sm text-muted-foreground">Trang {page} / {pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Sau</Button>
        </div>
      )}

      {/* Create Plant Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo cây mới</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên cây *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="VD: Monstera Deliciosa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scientificName">Tên khoa học</Label>
                <Input
                  id="scientificName"
                  value={formData.scientificName}
                  onChange={(e) => handleChange("scientificName", e.target.value)}
                  placeholder="VD: Monstera deliciosa"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => handleChange("categoryId", v)}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Độ khó</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(v) => handleChange("difficultyLevel", v)}
                >
                  <SelectTrigger id="difficultyLevel">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dễ">Dễ</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Khó">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Danh sách ảnh (URL, phân cách bằng dấu phẩy)</Label>
              <Textarea
                id="images"
                value={formData.images}
                onChange={(e) => handleChange("images", e.target.value)}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Mô tả ngắn</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleChange("shortDescription", e.target.value)}
                placeholder="Một câu mô tả ngắn về cây"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Nhập mô tả chi tiết về cây..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sunlight">Ánh sáng</Label>
                <Input
                  id="sunlight"
                  value={formData.sunlight}
                  onChange={(e) => handleChange("sunlight", e.target.value)}
                  placeholder="VD: Ánh sáng gián tiếp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Độ ẩm</Label>
                <Input
                  id="humidity"
                  value={formData.humidity}
                  onChange={(e) => handleChange("humidity", e.target.value)}
                  placeholder="VD: 60-80%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil">Loại đất</Label>
                <Input
                  id="soil"
                  value={formData.soil}
                  onChange={(e) => handleChange("soil", e.target.value)}
                  placeholder="VD: Đất thoát nước tốt"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperatureMin">Nhiệt độ thấp nhất (°C)</Label>
                <Input
                  id="temperatureMin"
                  type="number"
                  value={formData.temperatureMin}
                  onChange={(e) => handleChange("temperatureMin", e.target.value)}
                  placeholder="VD: 18"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatureMax">Nhiệt độ cao nhất (°C)</Label>
                <Input
                  id="temperatureMax"
                  type="number"
                  value={formData.temperatureMax}
                  onChange={(e) => handleChange("temperatureMax", e.target.value)}
                  placeholder="VD: 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Nguồn gốc</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleChange("origin", e.target.value)}
                  placeholder="VD: Châu Mỹ nhiệt đới"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="VD: cây cảnh, trong nhà, dễ trồng"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="toxicity"
                checked={formData.toxicity}
                onCheckedChange={(v) => handleChange("toxicity", v)}
              />
              <Label htmlFor="toxicity" className="cursor-pointer">
                Có độc tính (toxic)
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCloseForm} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo mới
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const { categories, loading, refetch } = usePlantCategories();
  const { create, loading: creating } = useCreateCategory();
  const { remove, loading: deleting } = useDeleteCategory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      await create({ name: trimmed });
      toast.success("Tạo danh mục thành công");
      setNewCategoryName("");
      setIsFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (e, cat) => {
    e.stopPropagation();
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      await remove(cat.id || cat._id);
      toast.success("Xóa danh mục thành công");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const isSubmitting = creating || deleting;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Danh mục Plants</h2>
          <p className="text-sm text-muted-foreground">Quản lý các danh mục phân loại cây</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mới
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-muted-foreground">Chưa có danh mục nào. Nhấn "Tạo mới" để thêm.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id || cat._id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium truncate">{cat.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
                onClick={(e) => handleDelete(e, cat)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo danh mục mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Tên danh mục *</Label>
              <Input
                id="catName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="VD: Cây tre, Cây ăn quả, Cây cảnh..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

function ManagePlants() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Plants</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý cây trồng và danh mục phân loại
        </p>
      </div>

      <Tabs defaultValue="plants" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-64">
          <TabsTrigger value="plants" className="gap-2">
            <Home className="h-4 w-4" />
            Plants
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Danh mục
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plants" className="mt-6">
          <PlantsTab />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { ManagePlants };
