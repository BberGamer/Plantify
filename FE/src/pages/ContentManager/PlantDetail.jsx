// PlantDetail.jsx - Trang chi tiết Plant cho Content Manager
// Hiển thị thông tin cây theo model Plant (17 fields) + Tabs: Tổng quan, Care Guides, Bệnh cây
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Pencil, Trash2, Loader2,
  Droplets, Sun, Thermometer, Wind, Leaf,
  Plus, AlertCircle, Sprout, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { usePlants, useUpdatePlant, useDeletePlant, usePlantCategories } from "@/features/plants/hooks";
import { useCareGuides, useCreateCareGuide } from "@/features/care-guides/hooks";
import { usePlantDiseases, useCreatePlantDisease } from "@/features/plant-diseases/hooks";
import { toast } from "sonner";

import "@/styles/ManagerPlantDetail.css";

// Màu cho độ khó
const DIFFICULTY_COLORS = {
  "Dễ": "text-green-600",
  "Trung bình": "text-yellow-600",
  "Khó": "text-red-600",
};

// Mùa
const SEASON_OPTIONS = [
  { value: "all", label: "Tất cả mùa" },
  { value: "spring", label: "Mùa xuân" },
  { value: "summer", label: "Mùa hè" },
  { value: "autumn", label: "Mùa thu" },
  { value: "winter", label: "Mùa đông" },
];

const SEASON_COLORS = {
  spring: "bg-pink-100 text-pink-700 border-pink-200",
  summer: "bg-yellow-100 text-yellow-700 border-yellow-200",
  autumn: "bg-orange-100 text-orange-700 border-orange-200",
  winter: "bg-blue-100 text-blue-700 border-blue-200",
  all: "bg-gray-100 text-gray-700 border-gray-200",
};

// Mức độ nghiêm trọng bệnh
const SEVERITY_CONFIG = {
  low: { label: "Thấp", color: "bg-green-100 text-green-700 border-green-200" },
  medium: { label: "Trung bình", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  high: { label: "Cao", color: "bg-red-100 text-red-700 border-red-200" },
};

// Form rỗng cho Plant (đúng 17 fields)
const EMPTY_PLANT_FORM = {
  name: "",
  scientificName: "",
  categoryId: "",
  thumbnail: "",
  images: "",
  shortDescription: "",
  description: "",
  difficultyLevel: "",
  sunlight: "",
  humidity: "",
  temperatureMin: "",
  temperatureMax: "",
  origin: "",
  soil: "",
  toxicity: false,
  tags: "",
};

const toCommaString = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "");
const toCommaArray = (str) => (str ? str.split(",").map((t) => t.trim()).filter(Boolean) : []);

function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy thông tin plant
  const { plants, loading: loadingPlants, refetch: refetchPlants } = usePlants({ search: "", limit: 100 });
  const plant = plants.find((p) => p._id === id || p.id === id);

  // Lấy categories để hiển thị tên
  const { categories } = usePlantCategories();
  const category = categories.find((c) => c._id === plant?.categoryId || c.id === plant?.categoryId);

  // Care Guides của plant này
  const { careGuides, loading: loadingCareGuides, refetch: refetchCareGuides } = useCareGuides({ limit: 100 });
  const plantCareGuides = careGuides.filter((cg) => cg.plantId === id || cg.plantId === plant?.id);

  // Diseases liên quan
  const { diseases, loading: loadingDiseases, refetch: refetchDiseases } = usePlantDiseases({ limit: 100 });
  const plantDiseases = diseases.filter((d) =>
    (d.affectedPlants || []).some((p) => p.toLowerCase?.().includes(plant?.name?.toLowerCase() || ""))
  );

  // Mutations
  const { update: updatePlant, loading: updatingPlant } = useUpdatePlant();
  const { remove: deletePlant, loading: deletingPlant } = useDeletePlant();
  const { create: createCareGuide, loading: creatingCareGuide } = useCreateCareGuide();
  const { create: createDisease, loading: creatingDisease } = useCreatePlantDisease();

  // State cho form chỉnh sửa
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_PLANT_FORM);

  // State cho modal thêm Care Guide
  const [isCareGuideOpen, setIsCareGuideOpen] = useState(false);
  const [careGuideForm, setCareGuideForm] = useState({
    title: "",
    content: "",
    season: "all",
    wateringFrequency: "",
    fertilizingFrequency: "",
    pruningNotes: "",
  });

  // State cho modal thêm Disease
  const [isDiseaseOpen, setIsDiseaseOpen] = useState(false);
  const [diseaseForm, setDiseaseForm] = useState({
    name: "",
    symptoms: "",
    causes: "",
    treatment: "",
    prevention: "",
    severity: "medium",
    affectedPlants: "",
  });

  // Load plant data vào form khi mở edit
  useEffect(() => {
    if (plant && isEditOpen) {
      setEditForm({
        name: plant.name || "",
        scientificName: plant.scientificName || "",
        categoryId: plant.categoryId || "",
        thumbnail: plant.thumbnail || "",
        images: toCommaString(plant.images),
        shortDescription: plant.shortDescription || "",
        description: plant.description || "",
        difficultyLevel: plant.difficultyLevel || "",
        sunlight: plant.sunlight || "",
        humidity: plant.humidity || "",
        temperatureMin: plant.temperatureMin ?? "",
        temperatureMax: plant.temperatureMax ?? "",
        origin: plant.origin || "",
        soil: plant.soil || "",
        toxicity: plant.toxicity ?? false,
        tags: toCommaString(plant.tags),
      });
    }
  }, [plant, isEditOpen]);

  // Xử lý submit chỉnh sửa Plant
  const handleUpdatePlant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        images: toCommaArray(editForm.images),
        tags: toCommaArray(editForm.tags),
        temperatureMin: editForm.temperatureMin !== "" ? Number(editForm.temperatureMin) : undefined,
        temperatureMax: editForm.temperatureMax !== "" ? Number(editForm.temperatureMax) : undefined,
      };
      await updatePlant(id, payload);
      toast.success("Cập nhật cây thành công");
      setIsEditOpen(false);
      refetchPlants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  // Xử lý xóa Plant
  const handleDeletePlant = async () => {
    if (!confirm(`Xóa cây "${plant?.name}"?`)) return;
    try {
      await deletePlant(id);
      toast.success("Xóa cây thành công");
      navigate("/content/plants");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  // Xử lý thêm Care Guide
  const handleCreateCareGuide = async (e) => {
    e.preventDefault();
    try {
      await createCareGuide({
        ...careGuideForm,
        plantId: id,
      });
      toast.success("Thêm Care Guide thành công");
      setIsCareGuideOpen(false);
      setCareGuideForm({ title: "", content: "", season: "all", wateringFrequency: "", fertilizingFrequency: "", pruningNotes: "" });
      refetchCareGuides();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo Care Guide");
    }
  };

  // Xử lý thêm Disease
  const handleCreateDisease = async (e) => {
    e.preventDefault();
    try {
      await createDisease({
        ...diseaseForm,
        affectedPlants: [plant?.name, ...toCommaArray(diseaseForm.affectedPlants)],
      });
      toast.success("Thêm bệnh cây thành công");
      setIsDiseaseOpen(false);
      setDiseaseForm({ name: "", symptoms: "", causes: "", treatment: "", prevention: "", severity: "medium", affectedPlants: "" });
      refetchDiseases();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo bệnh cây");
    }
  };

  // Loading state
  if (loadingPlants) {
    return (
      <div className="plant-detail-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Không tìm thấy
  if (!plant) {
    return (
      <div className="plant-detail-not-found">
        <h2>Không tìm thấy cây</h2>
        <Button variant="outline" onClick={() => navigate("/content/plants")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const isSubmittingPlant = updatingPlant;
  const isSubmittingCareGuide = creatingCareGuide;
  const isSubmittingDisease = creatingDisease;

  // Lấy ảnh chính (images[0] hoặc thumbnail)
  const mainImage = plant.thumbnail || plant.images?.[0];

  return (
    <div className="plant-detail">
      {/* Header: Back + Title + Actions */}
      <div className="plant-detail-header">
        <div className="plant-detail-header-left">
          <Button variant="ghost" size="icon" onClick={() => navigate("/content/plants")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Chi tiết Cây</h1>
        </div>
        <div className="plant-detail-header-actions">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Sửa
          </Button>
          <Button variant="outline" onClick={handleDeletePlant} className="text-destructive hover:text-destructive" disabled={deletingPlant}>
            <Trash2 className="w-4 h-4 mr-2" /> Xóa
          </Button>
        </div>
      </div>

      {/* Main Grid: Ảnh + Thông tin */}
      <div className="plant-detail-grid">
        {/* Cột trái: Ảnh lớn */}
        <div className="plant-detail-image-wrapper">
          <div className="plant-detail-image">
            <ImageWithFallback
              src={mainImage}
              alt={plant.name}
              className="w-full h-full object-cover"
              fallback={
                <div className="plant-detail-image-placeholder">
                  <Sprout className="w-16 h-16 text-muted-foreground/50" />
                  <span>Không có ảnh</span>
                </div>
              }
            />
          </div>
        </div>

        {/* Cột phải: Thông tin cây */}
        <div className="plant-detail-info">
          {/* Name */}
          <h2 className="plant-detail-name">{plant.name}</h2>

          {/* Scientific Name */}
          {plant.scientificName && (
            <p className="plant-detail-scientific-name">{plant.scientificName}</p>
          )}

          {/* Origin */}
          {plant.origin && (
            <div className="plant-detail-info-row">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>Nguồn gốc:</span>
              <span>{plant.origin}</span>
            </div>
          )}

          {/* Short Description */}
          {plant.shortDescription && (
            <p className="plant-detail-short-desc">{plant.shortDescription}</p>
          )}

          <Separator />

          {/* Description */}
          {plant.description && (
            <p className="plant-detail-description">{plant.description}</p>
          )}

          {/* Difficulty Level */}
          {plant.difficultyLevel && (
            <div className="plant-detail-info-row">
              <span>Độ khó:</span>
              <span className={`font-medium ${DIFFICULTY_COLORS[plant.difficultyLevel]}`}>
                {plant.difficultyLevel}
              </span>
            </div>
          )}

          {/* Category */}
          {category?.name && (
            <div className="plant-detail-info-row">
              <span>Danh mục:</span>
              <span>{category.name}</span>
            </div>
          )}

          {/* Tags */}
          {plant.tags?.length > 0 && (
            <div className="plant-detail-tags">
              {plant.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="plant-detail-tag">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="plant-detail-tabs">
        <TabsList className="plant-detail-tabs-list">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="care-guides">
            Care Guides ({plantCareGuides.length})
          </TabsTrigger>
          <TabsTrigger value="diseases">
            Bệnh cây ({plantDiseases.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Tổng quan */}
        <TabsContent value="overview" className="plant-detail-tabs-content">
          <div className="plant-detail-overview-grid">
            {plant.sunlight && (
              <Card>
                <CardContent className="plant-detail-overview-card">
                  <div className="plant-detail-overview-icon sunlight">
                    <Sun className="w-6 h-6" />
                  </div>
                  <p className="plant-detail-overview-label">Ánh sáng</p>
                  <p className="plant-detail-overview-value">{plant.sunlight}</p>
                </CardContent>
              </Card>
            )}

            {plant.humidity && (
              <Card>
                <CardContent className="plant-detail-overview-card">
                  <div className="plant-detail-overview-icon humidity">
                    <Wind className="w-6 h-6" />
                  </div>
                  <p className="plant-detail-overview-label">Độ ẩm</p>
                  <p className="plant-detail-overview-value">{plant.humidity}</p>
                </CardContent>
              </Card>
            )}

            {(plant.temperatureMin !== undefined || plant.temperatureMax !== undefined) && (
              <Card>
                <CardContent className="plant-detail-overview-card">
                  <div className="plant-detail-overview-icon temperature">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <p className="plant-detail-overview-label">Nhiệt độ</p>
                  <p className="plant-detail-overview-value">
                    {plant.temperatureMin ?? "?"}°C – {plant.temperatureMax ?? "?"}°C
                  </p>
                </CardContent>
              </Card>
            )}

            {plant.soil && (
              <Card>
                <CardContent className="plant-detail-overview-card">
                  <div className="plant-detail-overview-icon soil">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <p className="plant-detail-overview-label">Loại đất</p>
                  <p className="plant-detail-overview-value">{plant.soil}</p>
                </CardContent>
              </Card>
            )}

            {plant.toxicity !== undefined && (
              <Card>
                <CardContent className="plant-detail-overview-card">
                  <div className={`plant-detail-overview-icon ${plant.toxicity ? "toxicity-yes" : "toxicity-no"}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="plant-detail-overview-label">Độc tính</p>
                  <p className={`plant-detail-overview-value ${plant.toxicity ? "toxicity-yes" : "toxicity-no"}`}>
                    {plant.toxicity ? "Có" : "Không"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab Care Guides */}
        <TabsContent value="care-guides" className="plant-detail-tabs-content">
          <div className="plant-detail-tab-header">
            <h2 className="plant-detail-tab-title">Danh sách Care Guides</h2>
            <Button onClick={() => setIsCareGuideOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Thêm Care Guide
            </Button>
          </div>

          {loadingCareGuides ? (
            <div className="plant-detail-loading">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : plantCareGuides.length === 0 ? (
            <Card className="plant-detail-empty">
              <Leaf className="w-12 h-12 text-muted-foreground plant-detail-empty-icon" />
              <p className="plant-detail-empty-text">Chưa có Care Guide nào cho cây này.</p>
              <Button variant="outline" onClick={() => setIsCareGuideOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm Care Guide đầu tiên
              </Button>
            </Card>
          ) : (
            <div className="plant-detail-list-grid">
              {plantCareGuides.map((cg) => (
                <Card key={cg._id || cg.id} className="plant-detail-card">
                  <div className="plant-detail-card-header">
                    <div className="plant-detail-card-title">
                      <Droplets className="w-5 h-5" />
                      <h3>{cg.title}</h3>
                    </div>
                    <Badge className={SEASON_COLORS[cg.season] || "bg-gray-100"}>
                      {SEASON_OPTIONS.find((s) => s.value === cg.season)?.label || cg.season}
                    </Badge>
                  </div>
                  <div className="plant-detail-card-meta">
                    {cg.wateringFrequency && (
                      <div className="plant-detail-card-meta-item">
                        <Droplets className="text-blue-400" />
                        Tưới: {cg.wateringFrequency}
                      </div>
                    )}
                    {cg.fertilizingFrequency && (
                      <div className="plant-detail-card-meta-item">
                        <Sun className="text-yellow-400" />
                        Bón phân: {cg.fertilizingFrequency}
                      </div>
                    )}
                  </div>
                  {cg.content && (
                    <p className="plant-detail-card-preview">{cg.content}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Bệnh cây */}
        <TabsContent value="diseases" className="plant-detail-tabs-content">
          <div className="plant-detail-tab-header">
            <h2 className="plant-detail-tab-title">Bệnh thường gặp</h2>
            <Button onClick={() => setIsDiseaseOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Thêm Bệnh
            </Button>
          </div>

          {loadingDiseases ? (
            <div className="plant-detail-loading">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : plantDiseases.length === 0 ? (
            <Card className="plant-detail-empty">
              <AlertCircle className="w-12 h-12 text-muted-foreground plant-detail-empty-icon" />
              <p className="plant-detail-empty-text">Chưa có thông tin bệnh cho cây này.</p>
              <Button variant="outline" onClick={() => setIsDiseaseOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm bệnh đầu tiên
              </Button>
            </Card>
          ) : (
            <div className="plant-detail-list-grid">
              {plantDiseases.map((disease) => (
                <Card key={disease._id || disease.id} className="plant-detail-card">
                  <div className="plant-detail-card-header">
                    <div className="plant-detail-card-title">
                      <AlertCircle className="w-5 h-5 plant-detail-disease-icon" />
                      <h3>{disease.name}</h3>
                    </div>
                    {disease.severity && (
                      <Badge className={SEVERITY_CONFIG[disease.severity]?.color}>
                        {SEVERITY_CONFIG[disease.severity]?.label}
                      </Badge>
                    )}
                  </div>
                  {disease.symptoms && (
                    <div className="plant-detail-card-content">
                      <span className="plant-detail-card-label">Triệu chứng: </span>
                      {disease.symptoms}
                    </div>
                  )}
                  {disease.causes && (
                    <div className="plant-detail-card-content">
                      <span className="plant-detail-card-label">Nguyên nhân: </span>
                      {disease.causes}
                    </div>
                  )}
                  {disease.treatment && (
                    <div className="plant-detail-card-content">
                      <span className="plant-detail-card-treatment">Điều trị: </span>
                      {disease.treatment}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal chỉnh sửa Plant */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa cây</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePlant} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên cây *</Label>
                <Input id="name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scientificName">Tên khoa học</Label>
                <Input id="scientificName" value={editForm.scientificName} onChange={(e) => setEditForm((p) => ({ ...p, scientificName: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select value={editForm.categoryId} onValueChange={(v) => setEditForm((p) => ({ ...p, categoryId: v }))}>
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
                <Select value={editForm.difficultyLevel} onValueChange={(v) => setEditForm((p) => ({ ...p, difficultyLevel: v }))}>
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
              <Input id="thumbnail" value={editForm.thumbnail} onChange={(e) => setEditForm((p) => ({ ...p, thumbnail: e.target.value }))} />
              {editForm.thumbnail && <img src={editForm.thumbnail} alt="" className="h-20 w-auto rounded-md object-cover mt-2" onError={(e) => e.target.style.display = "none"} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Danh sách ảnh (phân cách bằng dấu phẩy)</Label>
              <Textarea id="images" value={editForm.images} onChange={(e) => setEditForm((p) => ({ ...p, images: e.target.value }))} rows={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Mô tả ngắn</Label>
              <Input id="shortDescription" value={editForm.shortDescription} onChange={(e) => setEditForm((p) => ({ ...p, shortDescription: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea id="description" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} rows={4} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sunlight">Ánh sáng</Label>
                <Select value={editForm.sunlight} onValueChange={(v) => setEditForm((p) => ({ ...p, sunlight: v }))}>
                  <SelectTrigger id="sunlight"><SelectValue placeholder="Chọn ánh sáng" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trực tiếp">Trực tiếp</SelectItem>
                    <SelectItem value="Gián tiếp">Gián tiếp</SelectItem>
                    <SelectItem value="Bóng râm">Bóng râm</SelectItem>
                    <SelectItem value="Bất kỳ">Bất kỳ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Độ ẩm</Label>
                <Select value={editForm.humidity} onValueChange={(v) => setEditForm((p) => ({ ...p, humidity: v }))}>
                  <SelectTrigger id="humidity"><SelectValue placeholder="Chọn độ ẩm" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cao (80-100%)">Cao (80-100%)</SelectItem>
                    <SelectItem value="Trung bình (50-70%)">Trung bình (50-70%)</SelectItem>
                    <SelectItem value="Thấp (30-50%)">Thấp (30-50%)</SelectItem>
                    <SelectItem value="Khô dưới 30%">Khô (dưới 30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil">Loại đất</Label>
                <Select value={editForm.soil} onValueChange={(v) => setEditForm((p) => ({ ...p, soil: v }))}>
                  <SelectTrigger id="soil"><SelectValue placeholder="Chọn loại đất" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đất thoáng nước">Đất thoáng nước</SelectItem>
                    <SelectItem value="Đất giữ ẩm">Đất giữ ẩm</SelectItem>
                    <SelectItem value="Đất cát">Đất cát</SelectItem>
                    <SelectItem value="Đất sét">Đất sét</SelectItem>
                    <SelectItem value="Xương cá">Xương cá</SelectItem>
                    <SelectItem value="Than hoạt tính">Than hoạt tính</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperatureMin">Nhiệt độ min (°C)</Label>
                <Input id="temperatureMin" type="number" value={editForm.temperatureMin} onChange={(e) => setEditForm((p) => ({ ...p, temperatureMin: e.target.value }))} placeholder="VD: 15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatureMax">Nhiệt độ max (°C)</Label>
                <Input id="temperatureMax" type="number" value={editForm.temperatureMax} onChange={(e) => setEditForm((p) => ({ ...p, temperatureMax: e.target.value }))} placeholder="VD: 30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Nguồn gốc</Label>
                <Select value={editForm.origin} onValueChange={(v) => setEditForm((p) => ({ ...p, origin: v }))}>
                  <SelectTrigger id="origin"><SelectValue placeholder="Chọn nguồn gốc" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Châu Á">Châu Á</SelectItem>
                    <SelectItem value="Châu Âu">Châu Âu</SelectItem>
                    <SelectItem value="Châu Phi">Châu Phi</SelectItem>
                    <SelectItem value="Châu Mỹ">Châu Mỹ</SelectItem>
                    <SelectItem value="Châu Úc">Châu Úc</SelectItem>
                    <SelectItem value="Việt Nam">Việt Nam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toxicity">Độc tính</Label>
              <Select value={String(editForm.toxicity)} onValueChange={(v) => setEditForm((p) => ({ ...p, toxicity: v === "true" }))}>
                <SelectTrigger id="toxicity"><SelectValue placeholder="Chọn độc tính" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Không độc (An toàn)</SelectItem>
                  <SelectItem value="true">Có độc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input id="tags" value={editForm.tags} onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))} placeholder="VD: cây cảnh, trong nhà, dễ chăm" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSubmittingPlant}>
                {isSubmittingPlant && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal thêm Care Guide */}
      <Dialog open={isCareGuideOpen} onOpenChange={setIsCareGuideOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm Care Guide cho {plant.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCareGuide} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cg-title">Tiêu đề *</Label>
              <Input id="cg-title" value={careGuideForm.title} onChange={(e) => setCareGuideForm((p) => ({ ...p, title: e.target.value }))} placeholder="VD: Hướng dẫn tưới nước mùa hè" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cg-season">Mùa</Label>
                <Select value={careGuideForm.season} onValueChange={(v) => setCareGuideForm((p) => ({ ...p, season: v }))}>
                  <SelectTrigger id="cg-season"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEASON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cg-watering">Tần suất tưới</Label>
                <Input id="cg-watering" value={careGuideForm.wateringFrequency} onChange={(e) => setCareGuideForm((p) => ({ ...p, wateringFrequency: e.target.value }))} placeholder="VD: 2 lần/tuần" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cg-fertilizer">Tần suất bón phân</Label>
              <Input id="cg-fertilizer" value={careGuideForm.fertilizingFrequency} onChange={(e) => setCareGuideForm((p) => ({ ...p, fertilizingFrequency: e.target.value }))} placeholder="VD: 1 tháng/lần" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cg-pruning">Ghi chú cắt tỉa</Label>
              <Textarea id="cg-pruning" value={careGuideForm.pruningNotes} onChange={(e) => setCareGuideForm((p) => ({ ...p, pruningNotes: e.target.value }))} rows={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cg-content">Nội dung chi tiết</Label>
              <Textarea id="cg-content" value={careGuideForm.content} onChange={(e) => setCareGuideForm((p) => ({ ...p, content: e.target.value }))} rows={4} placeholder="Nhập hướng dẫn chi tiết..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCareGuideOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSubmittingCareGuide}>
                {isSubmittingCareGuide && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Thêm Care Guide
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal thêm Bệnh */}
      <Dialog open={isDiseaseOpen} onOpenChange={setIsDiseaseOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm bệnh cho {plant.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDisease} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="d-name">Tên bệnh *</Label>
              <Input id="d-name" value={diseaseForm.name} onChange={(e) => setDiseaseForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: Bệnh đốm nâu" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="d-severity">Mức độ nghiêm trọng</Label>
                <Select value={diseaseForm.severity} onValueChange={(v) => setDiseaseForm((p) => ({ ...p, severity: v }))}>
                  <SelectTrigger id="d-severity"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-affected">Cây bị ảnh hưởng khác</Label>
                <Input id="d-affected" value={diseaseForm.affectedPlants} onChange={(e) => setDiseaseForm((p) => ({ ...p, affectedPlants: e.target.value }))} placeholder="VD: Lúa, Ngô" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-symptoms">Triệu chứng</Label>
              <Textarea id="d-symptoms" value={diseaseForm.symptoms} onChange={(e) => setDiseaseForm((p) => ({ ...p, symptoms: e.target.value }))} rows={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-causes">Nguyên nhân</Label>
              <Textarea id="d-causes" value={diseaseForm.causes} onChange={(e) => setDiseaseForm((p) => ({ ...p, causes: e.target.value }))} rows={2} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="d-treatment">Cách điều trị</Label>
                <Textarea id="d-treatment" value={diseaseForm.treatment} onChange={(e) => setDiseaseForm((p) => ({ ...p, treatment: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-prevention">Phòng ngừa</Label>
                <Textarea id="d-prevention" value={diseaseForm.prevention} onChange={(e) => setDiseaseForm((p) => ({ ...p, prevention: e.target.value }))} rows={2} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDiseaseOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSubmittingDisease}>
                {isSubmittingDisease && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Thêm Bệnh
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { PlantDetail };
