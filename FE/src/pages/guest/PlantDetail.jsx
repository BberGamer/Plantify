import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  Loader2,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { PlantOverviewTab } from "@/features/plants/components/PlantOverviewTab";
import { CareGuideList, DiseaseList } from "@/features/plants/components/PlantDetailList";
import { usePlant, usePlantCategories } from "@/features/plants/hooks";
import { useCareGuides } from "@/features/care-guides/hooks";
import { usePlantDiseases } from "@/features/plant-diseases/hooks";
import { useFavorite } from "@/features/favorites/hooks";

import "@/styles/ManagerPlantDetail.css";

const DIFFICULTY_LABELS = {
  low: "Dễ",
  medium: "Trung bình",
  high: "Khó",
};

const DIFFICULTY_COLORS = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
  "Dễ": "text-green-600",
  "Trung bình": "text-yellow-600",
  "Khó": "text-red-600",
};

const VALID_TABS = new Set(["overview", "care-guides", "diseases"]);

function PlantDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(VALID_TABS.has(initialTab) ? initialTab : "overview");

  const { plant, loading, error } = usePlant(id);
  const { categories } = usePlantCategories();
  const { isFavorited, loading: favLoading, toggle: toggleFavorite } = useFavorite(id);
  const { careGuides, loading: loadingCareGuides } = useCareGuides({
    plantId: id,
    limit: 100,
  });
  const { diseases, loading: loadingDiseases } = usePlantDiseases({
    plantId: id,
    limit: 100,
  });

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [id]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    setActiveTab(VALID_TABS.has(tab) ? tab : "overview");
  }, [searchParams]);

  if (loading) {
    return (
      <div className="plant-detail-loading min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="plant-detail-not-found min-h-[60vh]">
        <h2>Không tìm thấy cây</h2>
        {error && <p className="text-sm text-muted-foreground mb-4">{error}</p>}
        <Button variant="outline" asChild>
          <Link to="/browse">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  const images = Array.isArray(plant.images) ? plant.images.filter(Boolean) : [];
  const mainImage = images[currentImageIndex] || images[0] || plant.thumbnail;
  const hasMultipleImages = images.length > 1;
  const category = categories.find(
    (item) => String(item._id || item.id) === String(plant.categoryId?._id || plant.categoryId),
  );
  const difficulty = DIFFICULTY_LABELS[plant.difficultyLevel] || plant.difficultyLevel;

  const goToPreviousImage = () => {
    setCurrentImageIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="plant-detail">
        <div className="plant-detail-header">
          <div className="plant-detail-header-left">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/browse" aria-label="Quay lại trang khám phá">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Chi tiết Cây</h1>
          </div>
        </div>

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
                  <button
                    type="button"
                    className="plant-detail-image-nav plant-detail-image-nav-prev"
                    onClick={goToPreviousImage}
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    className="plant-detail-image-nav plant-detail-image-nav-next"
                    onClick={goToNextImage}
                    aria-label="Ảnh tiếp theo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="plant-detail-image-dots">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        className={`plant-detail-image-dot ${index === currentImageIndex ? "active" : ""}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Xem ảnh ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="plant-detail-info">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="plant-detail-name mb-0">{plant.name}</h2>
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favLoading}
                aria-label={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                className="flex-shrink-0 p-2 rounded-full transition-all duration-200 hover:bg-red-50 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
              >
                <Heart
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isFavorited
                      ? "fill-red-500 text-red-500"
                      : "fill-white text-gray-400 stroke-[1.5]"
                  }`}
                />
              </button>
            </div>

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

            {difficulty && (
              <div className="plant-detail-info-row">
                <span>Độ khó:</span>
                <span className={`font-medium ${DIFFICULTY_COLORS[plant.difficultyLevel] || DIFFICULTY_COLORS[difficulty] || ""}`}>
                  {difficulty}
                </span>
              </div>
            )}

            {category?.name && (
              <div className="plant-detail-info-row">
                <span>Danh mục:</span>
                <span>{category.name}</span>
              </div>
            )}

            {plant.tags?.length > 0 && (
              <div className="plant-detail-tags">
                {plant.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="plant-detail-tag">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="plant-detail-tabs">
          <TabsList className="plant-detail-tabs-list">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="care-guides">
              Hướng dẫn chăm sóc ({careGuides.length})
            </TabsTrigger>
            <TabsTrigger value="diseases">
              Bệnh cây ({diseases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="plant-detail-tabs-content">
            <PlantOverviewTab plant={plant} />
          </TabsContent>

          <TabsContent value="care-guides" className="plant-detail-tabs-content">
            <CareGuideList careGuides={careGuides} loading={loadingCareGuides} />
          </TabsContent>

          <TabsContent value="diseases" className="plant-detail-tabs-content">
            <DiseaseList diseases={diseases} loading={loadingDiseases} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export { PlantDetail };
