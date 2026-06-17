// PlantDetail.jsx - Trang chi tiết Plant cho Content Manager
// Hiển thị thông tin cây + Tabs: Tổng quan, Care Guides, Bệnh cây
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Pencil, Trash2, Loader2, ImageIcon,
  Droplets, Sun, Thermometer, Wind, Home, BookOpen,
  Plus, ExternalLink, Leaf, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { usePlants, useUpdatePlant, useDeletePlant } from "@/features/plants/hooks";
import { useCareGuides, useCreateCareGuide } from "@/features/care-guides/hooks";
import { usePlantDiseases, useCreatePlantDisease } from "@/features/plant-diseases/hooks";
import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  "Dễ": "bg-green-100 text-green-700 border-green-200",
  "Trung bình": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Khó": "bg-red-100 text-red-700 border-red-200",
};

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

const SEVERITY_CONFIG = {
  low: { label: "Thấp", color: "bg-green-100 text-green-700 border-green-200" },
  medium: { label: "Trung bình", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  high: { label: "Cao", color: "bg-red-100 text-red-700 border-red-200" },
};

// Form mẫu cho Plant
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

const toCommaString = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "");
const toCommaArray = (str) => (str ? str.split(",").map((t) => t.trim()).filter(Boolean) : []);

function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy thông tin plant
  const { plants, loading: loadingPlants, refetch: refetchPlants } = usePlants({ search: "", limit: 100 });
  const plant = plants.find((p) => p._id === id || p.id === id);

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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Không tìm thấy
  if (!plant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy cây</h2>
        <Button variant="outline" onClick={() => navigate("/content/plants")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const isSubmittingPlant = updatingPlant;
  const isSubmittingCareGuide = creatingCareGuide;
  const isSubmittingDisease = creatingDisease;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/content/plants")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{plant.name}</h1>
            <p className="text-sm text-muted-foreground italic">{plant.scientificName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Sửa
          </Button>
          <Button variant="outline" onClick={handleDeletePlant} className="text-destructive hover:text-destructive" disabled={deletingPlant}>
            <Trash2 className="w-4 h-4 mr-2" /> Xóa
          </Button>
        </div>
      </div>

      {/* Card ảnh + thông tin cơ bản (luôn hiện) */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-5">
          {/* Ảnh */}
          <div className="md:col-span-2">
            <div className="aspect-[4/3] md:aspect-square">
              <ImageWithFallback
                src={plant.thumbnail || plant.images?.[0]}
                alt={plant.name}
                className="w-full h-full object-cover rounded-none md:rounded-l-xl"
                fallback={<div className="w-full h-full flex items-center justify-center bg-muted"><ImageIcon className="w-16 h-16 text-muted-foreground" /></div>}
              />
            </div>
          </div>
          {/* Thông tin cơ bản */}
          <div className="md:col-span-3 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={DIFFICULTY_COLORS[plant.difficultyLevel]}>
                {plant.difficultyLevel || "—"}
              </Badge>
              {plant.categoryId && <Badge variant="outline">{plant.categoryId}</Badge>}
              {plant.isIndoor && <Badge variant="outline">Trong nhà</Badge>}
              {plant.isPetFriendly && <Badge variant="outline">An toàn pet</Badge>}
              {!plant.isActive && <Badge variant="destructive">Đã ẩn</Badge>}
            </div>

            {plant.shortDescription && (
              <p className="text-muted-foreground mb-4">{plant.shortDescription}</p>
            )}

            {plant.description && (
              <p className="mb-4">{plant.description}</p>
            )}

            {/* Icons info grid */}
            <div className="grid grid-cols-2 gap-3">
              {plant.watering && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tưới nước</p>
                    <p className="text-sm font-medium">{plant.watering}</p>
                  </div>
                </div>
              )}
              {plant.sunlight && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ánh sáng</p>
                    <p className="text-sm font-medium">{plant.sunlight}</p>
                  </div>
                </div>
              )}
              {plant.temperature && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nhiệt độ</p>
                    <p className="text-sm font-medium">{plant.temperature}</p>
                  </div>
                </div>
              )}
              {plant.humidity && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-50">
                  <Wind className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Độ ẩm</p>
                    <p className="text-sm font-medium">{plant.humidity}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {plant.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3">
                {plant.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BookOpen className="w-4 h-4 mr-2" />Tổng quan</TabsTrigger>
          <TabsTrigger value="care-guides">
            <Droplets className="w-4 h-4 mr-2" />Care Guides ({plantCareGuides.length})
          </TabsTrigger>
          <TabsTrigger value="diseases">
            <AlertCircle className="w-4 h-4 mr-2" />Bệnh cây ({plantDiseases.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Tổng quan */}
        <TabsContent value="overview" className="mt-6">
          {/* Chi tiết chăm sóc */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chi tiết chăm sóc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {plant.soil && (
                  <div>
                    <p className="text-sm text-muted-foreground">Loại đất</p>
                    <p>{plant.soil}</p>
                  </div>
                )}
                {plant.fertilizer && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phân bón</p>
                    <p>{plant.fertilizer}</p>
                  </div>
                )}
                {plant.toxicity && (
                  <div>
                    <p className="text-sm text-muted-foreground">Độc tính</p>
                    <p>{plant.toxicity}</p>
                  </div>
                )}
                {plant.growthRate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tốc độ tăng trưởng</p>
                    <p>{plant.growthRate}</p>
                  </div>
                )}
                {plant.matureSize && (
                  <div>
                    <p className="text-sm text-muted-foreground">Kích thước trưởng thành</p>
                    <p>{plant.matureSize}</p>
                  </div>
                )}
                {plant.propagation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nhân giống</p>
                    <p>{plant.propagation}</p>
                  </div>
                )}
                {plant.origin && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nguồn gốc</p>
                    <p>{plant.origin}</p>
                  </div>
                )}
                {plant.repotting && (
                  <div>
                    <p className="text-sm text-muted-foreground">Thay chậu</p>
                    <p>{plant.repotting}</p>
                  </div>
                )}
                {plant.pruning && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cắt tỉa</p>
                    <p>{plant.pruning}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Care Guides */}
        <TabsContent value="care-guides" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Danh sách Care Guides</h2>
            <Button onClick={() => setIsCareGuideOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Thêm Care Guide
            </Button>
          </div>

          {loadingCareGuides ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : plantCareGuides.length === 0 ? (
            <Card className="py-12 text-center">
              <Leaf className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">Chưa có Care Guide nào cho cây này.</p>
              <Button variant="outline" onClick={() => setIsCareGuideOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm Care Guide đầu tiên
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {plantCareGuides.map((cg) => (
                <Card key={cg._id || cg.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{cg.title}</h3>
                        <Badge className={SEASON_COLORS[cg.season] || "bg-gray-100"}>
                          {SEASON_OPTIONS.find((s) => s.value === cg.season)?.label || cg.season}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {cg.wateringFrequency && (
                          <div className="flex items-center gap-1">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            Tưới: {cg.wateringFrequency}
                          </div>
                        )}
                        {cg.fertilizingFrequency && (
                          <div className="flex items-center gap-1">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            Bón phân: {cg.fertilizingFrequency}
                          </div>
                        )}
                      </div>
                      {cg.content && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{cg.content}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Bệnh cây */}
        <TabsContent value="diseases" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Bệnh thường gặp</h2>
            <Button onClick={() => setIsDiseaseOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Thêm Bệnh
            </Button>
          </div>

          {loadingDiseases ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : plantDiseases.length === 0 ? (
            <Card className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">Chưa có thông tin bệnh cho cây này.</p>
              <Button variant="outline" onClick={() => setIsDiseaseOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm bệnh đầu tiên
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {plantDiseases.map((disease) => (
                <Card key={disease._id || disease.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold">{disease.name}</h3>
                    </div>
                    {disease.severity && (
                      <Badge className={SEVERITY_CONFIG[disease.severity]?.color}>
                        {SEVERITY_CONFIG[disease.severity]?.label}
                      </Badge>
                    )}
                  </div>
                  {disease.symptoms && (
                    <div className="text-sm mb-2">
                      <span className="text-muted-foreground">Triệu chứng: </span>
                      {disease.symptoms}
                    </div>
                  )}
                  {disease.causes && (
                    <div className="text-sm mb-2">
                      <span className="text-muted-foreground">Nguyên nhân: </span>
                      {disease.causes}
                    </div>
                  )}
                  {disease.treatment && (
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">Điều trị: </span>
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
                <Label htmlFor="watering">Tưới nước</Label>
                <Select value={editForm.watering} onValueChange={(v) => setEditForm((p) => ({ ...p, watering: v }))}>
                  <SelectTrigger id="watering"><SelectValue placeholder="Chọn tần suất tưới" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hàng ngày">Hàng ngày</SelectItem>
                    <SelectItem value="2-3 ngày/lần">2-3 ngày/lần</SelectItem>
                    <SelectItem value="5-7 ngày/lần">5-7 ngày/lần</SelectItem>
                    <SelectItem value="10-14 ngày/lần">10-14 ngày/lần</SelectItem>
                    <SelectItem value="Khi đất khô">Khi đất khô</SelectItem>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperature">Nhiệt độ</Label>
                <Select value={editForm.temperature} onValueChange={(v) => setEditForm((p) => ({ ...p, temperature: v }))}>
                  <SelectTrigger id="temperature"><SelectValue placeholder="Chọn nhiệt độ" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10-15°C">10-15°C</SelectItem>
                    <SelectItem value="15-20°C">15-20°C</SelectItem>
                    <SelectItem value="18-25°C">18-25°C</SelectItem>
                    <SelectItem value="20-30°C">20-30°C</SelectItem>
                    <SelectItem value="25-35°C">25-35°C</SelectItem>
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fertilizer">Phân bón</Label>
                <Select value={editForm.fertilizer} onValueChange={(v) => setEditForm((p) => ({ ...p, fertilizer: v }))}>
                  <SelectTrigger id="fertilizer"><SelectValue placeholder="Chọn phân bón" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NPK cân bằng">NPK cân bằng</SelectItem>
                    <SelectItem value="Phân hữu cơ">Phân hữu cơ</SelectItem>
                    <SelectItem value="Phân tan chậm">Phân tan chậm</SelectItem>
                    <SelectItem value="Phân lá">Phân lá</SelectItem>
                    <SelectItem value="Không cần">Không cần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toxicity">Độc tính</Label>
                <Select value={editForm.toxicity} onValueChange={(v) => setEditForm((p) => ({ ...p, toxicity: v }))}>
                  <SelectTrigger id="toxicity"><SelectValue placeholder="Chọn độc tính" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="An toàn">An toàn</SelectItem>
                    <SelectItem value="Độc nhẹ">Độc nhẹ</SelectItem>
                    <SelectItem value="Độc trung bình">Độc trung bình</SelectItem>
                    <SelectItem value="Nguy hiểm">Nguy hiểm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="growthRate">Tốc độ tăng trưởng</Label>
                <Select value={editForm.growthRate} onValueChange={(v) => setEditForm((p) => ({ ...p, growthRate: v }))}>
                  <SelectTrigger id="growthRate"><SelectValue placeholder="Chọn tốc độ tăng trưởng" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chậm">Chậm</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Nhanh">Nhanh</SelectItem>
                    <SelectItem value="Rất nhanh">Rất nhanh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="matureSize">Kích thước trưởng thành</Label>
                <Select value={editForm.matureSize} onValueChange={(v) => setEditForm((p) => ({ ...p, matureSize: v }))}>
                  <SelectTrigger id="matureSize"><SelectValue placeholder="Chọn kích thước" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nhỏ dưới 30cm">Nhỏ (dưới 30cm)</SelectItem>
                    <SelectItem value="Trung bình 30-60cm">Trung bình (30-60cm)</SelectItem>
                    <SelectItem value="Lớn 60-100cm">Lớn (60-100cm)</SelectItem>
                    <SelectItem value="Rất lớn trên 100cm">Rất lớn (trên 100cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propagation">Nhân giống</Label>
                <Select value={editForm.propagation} onValueChange={(v) => setEditForm((p) => ({ ...p, propagation: v }))}>
                  <SelectTrigger id="propagation"><SelectValue placeholder="Chọn phương pháp" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Giâm cành">Giâm cành</SelectItem>
                    <SelectItem value="Tách bụi">Tách bụi</SelectItem>
                    <SelectItem value="Chiết cành">Chiết cành</SelectItem>
                    <SelectItem value="Gieo hạt">Gieo hạt</SelectItem>
                    <SelectItem value="Nuôi cấy mô">Nuôi cấy mô</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pruning">Cắt tỉa</Label>
                <Select value={editForm.pruning} onValueChange={(v) => setEditForm((p) => ({ ...p, pruning: v }))}>
                  <SelectTrigger id="pruning"><SelectValue placeholder="Chọn tần suất" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Không cần">Không cần</SelectItem>
                    <SelectItem value="Hàng tháng">Hàng tháng</SelectItem>
                    <SelectItem value="Hàng quý">Hàng quý</SelectItem>
                    <SelectItem value="Khi cần">Khi cần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="repotting">Thay chậu</Label>
                <Select value={editForm.repotting} onValueChange={(v) => setEditForm((p) => ({ ...p, repotting: v }))}>
                  <SelectTrigger id="repotting"><SelectValue placeholder="Chọn tần suất" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hàng năm">Hàng năm</SelectItem>
                    <SelectItem value="18 tháng/lần">18 tháng/lần</SelectItem>
                    <SelectItem value="2 năm/lần">2 năm/lần</SelectItem>
                    <SelectItem value="Khi cần">Khi cần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                <Input id="tags" value={editForm.tags} onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))} placeholder="VD: cây cảnh, trong nhà, dễ chăm" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="isIndoor" checked={editForm.isIndoor} onCheckedChange={(v) => setEditForm((p) => ({ ...p, isIndoor: v }))} />
                <Label htmlFor="isIndoor" className="cursor-pointer">Cây trong nhà</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isPetFriendly" checked={editForm.isPetFriendly} onCheckedChange={(v) => setEditForm((p) => ({ ...p, isPetFriendly: v }))} />
                <Label htmlFor="isPetFriendly" className="cursor-pointer">An toàn pet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isActive" checked={editForm.isActive} onCheckedChange={(v) => setEditForm((p) => ({ ...p, isActive: v }))} />
                <Label htmlFor="isActive" className="cursor-pointer">Hiển thị</Label>
              </div>
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
