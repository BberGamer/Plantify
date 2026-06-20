// PlantDetail.jsx - Trang chi tiết Plant cho Content Manager
import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Trash2, Loader2, Sprout, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { PlantEditForm, CareGuideForm } from "@/features/plants/components/PlantEditForm";
import { PlantOverviewTab } from "@/features/plants/components/PlantOverviewTab";
import { CareGuideList, DiseaseList } from "@/features/plants/components/PlantDetailList";
import { usePlants, useUpdatePlant, useDeletePlant, usePlantCategories } from "@/features/plants/hooks";
import { useCareGuides, useCreateCareGuide } from "@/features/care-guides/hooks";
import { usePlantDiseases } from "@/features/plant-diseases/hooks";
import { toast } from "sonner";

import "@/styles/ManagerPlantDetail.css";

const DIFFICULTY_COLORS = {
  "Dễ": "text-green-600",
  "Trung bình": "text-yellow-600",
  "Khó": "text-red-600",
};

function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const careGuideFormRef = useRef(null);

  // Lấy plant
  const { plants, loading: loadingPlants, refetch: refetchPlants } = usePlants({ search: "", limit: 100 });
  const plant = plants.find((p) => p._id === id);

  // Lấy categories
  const { categories } = usePlantCategories();

  // Care Guides
  const { careGuides, loading: loadingCareGuides, refetch: refetchCareGuides } = useCareGuides({ limit: 100 });
  const plantCareGuides = careGuides.filter((cg) => cg.plantId === id);

  // Diseases
  const { diseases, loading: loadingDiseases, refetch: refetchDiseases } = usePlantDiseases({ limit: 100 });
  const plantDiseases = diseases.filter((d) => String(d.plantId?._id || d.plantId) === id);

  // Mutations
  const { update: updatePlant, loading: updatingPlant } = useUpdatePlant();
  const { remove: deletePlant, loading: deletingPlant } = useDeletePlant();
  const { create: createCareGuide, loading: creatingCareGuide } = useCreateCareGuide();

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = plant?.images || [];
  const goToPrev = () => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goToNext = () => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  const mainImage = images[currentImageIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  // Handlers
  const handleUpdatePlant = async (payload) => {
    await updatePlant(id, payload);
    toast.success("Cập nhật cây thành công");
    refetchPlants();
  };

  const handleDeletePlant = async () => {
    if (!confirm(`Xóa cây "${plant?.name}"?`)) return;
    await deletePlant(id);
    toast.success("Xóa cây thành công");
    navigate("/content/plants");
  };

  const handleCreateCareGuide = async (payload) => {
    await createCareGuide(payload);
    toast.success("Thêm Care Guide thành công");
    refetchCareGuides();
  };

  const openCareGuideForm = () => careGuideFormRef.current?.open();

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

  return (
    <div className="plant-detail">
      {/* Header */}
      <div className="plant-detail-header">
        <div className="plant-detail-header-left">
          <Button variant="ghost" size="icon" onClick={() => navigate("/content/plants")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Chi tiết Cây</h1>
        </div>
        <div className="plant-detail-header-actions">
          <PlantEditForm plant={plant} categories={categories} onUpdate={handleUpdatePlant} loading={updatingPlant} />
          <Button variant="outline" onClick={handleDeletePlant} className="text-destructive hover:text-destructive" disabled={deletingPlant}>
            <Trash2 className="w-4 h-4 mr-2" /> Xóa
          </Button>
        </div>
      </div>

      {/* Main Grid: Ảnh + Thông tin */}
      <div className="plant-detail-grid">
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

            {hasMultipleImages && (
              <>
                <button className="plant-detail-image-nav plant-detail-image-nav-prev" onClick={goToPrev}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button className="plant-detail-image-nav plant-detail-image-nav-next" onClick={goToNext}>
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="plant-detail-image-dots">
                  {images.map((_, idx) => (
                    <span key={idx} className={`plant-detail-image-dot ${idx === currentImageIndex ? "active" : ""}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="plant-detail-info">
          <h2 className="plant-detail-name">{plant.name}</h2>

          {plant.scientificName && (
            <p className="plant-detail-scientific-name">{plant.scientificName}</p>
          )}

          {plant.origin && (
            <div className="plant-detail-info-row">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>Nguồn gốc:</span>
              <span>{plant.origin}</span>
            </div>
          )}

          {plant.shortDescription && (
            <p className="plant-detail-short-desc">{plant.shortDescription}</p>
          )}

          <Separator />

          {plant.description && (
            <p className="plant-detail-description">{plant.description}</p>
          )}

          {plant.difficultyLevel && (
            <div className="plant-detail-info-row">
              <span>Độ khó:</span>
              <span className={`font-medium ${DIFFICULTY_COLORS[plant.difficultyLevel]}`}>
                {plant.difficultyLevel}
              </span>
            </div>
          )}

          {categories.find((c) => c._id === plant?.categoryId)?.name && (
            <div className="plant-detail-info-row">
              <span>Danh mục:</span>
              <span>{categories.find((c) => c._id === plant?.categoryId)?.name}</span>
            </div>
          )}

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
            Hướng dẫn chăm sóc ({plantCareGuides.length})
          </TabsTrigger>
          <TabsTrigger value="diseases">
            Bệnh cây ({plantDiseases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="plant-detail-tabs-content">
          <PlantOverviewTab plant={plant} />
        </TabsContent>

        <TabsContent value="care-guides" className="plant-detail-tabs-content">
          <CareGuideList careGuides={plantCareGuides} loading={loadingCareGuides} />
        </TabsContent>

        <TabsContent value="diseases" className="plant-detail-tabs-content">
          <DiseaseList diseases={plantDiseases} loading={loadingDiseases} />
        </TabsContent>
      </Tabs>

      {/* Hidden forms */}
      <div className="hidden">
        <CareGuideForm
          ref={careGuideFormRef}
          plantId={id}
          plantName={plant.name}
          onCreate={handleCreateCareGuide}
          loading={creatingCareGuide}
        />
      </div>
    </div>
  );
}

export { PlantDetail };
