// PlantDetailList.jsx - Component hiển thị danh sách Care Guides và Diseases
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Droplets, Sun, Leaf, AlertCircle } from "lucide-react";

// Constants
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

/**
 * CareGuideList - Danh sách Care Guides
 */
export function CareGuideList({ careGuides, loading, onAdd }) {
  return (
    <>
      <div className="plant-detail-tab-header">
        <h2 className="plant-detail-tab-title">Danh sách Care Guides</h2>
        <Button onClick={onAdd}>
          <Leaf className="w-4 h-4 mr-2" /> Thêm Care Guide
        </Button>
      </div>

      {loading ? (
        <div className="plant-detail-loading">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : careGuides.length === 0 ? (
        <Card className="plant-detail-empty">
          <Leaf className="w-12 h-12 text-muted-foreground plant-detail-empty-icon" />
          <p className="plant-detail-empty-text">Chưa có Care Guide nào cho cây này.</p>
          <Button variant="outline" onClick={onAdd}>
            <Leaf className="w-4 h-4 mr-2" /> Thêm Care Guide đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="plant-detail-list-grid">
          {careGuides.map((cg) => (
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
    </>
  );
}

/**
 * DiseaseList - Danh sách Bệnh cây
 */
export function DiseaseList({ diseases, loading, onAdd }) {
  return (
    <>
      <div className="plant-detail-tab-header">
        <h2 className="plant-detail-tab-title">Bệnh thường gặp</h2>
        <Button onClick={onAdd}>
          <AlertCircle className="w-4 h-4 mr-2" /> Thêm Bệnh
        </Button>
      </div>

      {loading ? (
        <div className="plant-detail-loading">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : diseases.length === 0 ? (
        <Card className="plant-detail-empty">
          <AlertCircle className="w-12 h-12 text-muted-foreground plant-detail-empty-icon" />
          <p className="plant-detail-empty-text">Chưa có thông tin bệnh cho cây này.</p>
          <Button variant="outline" onClick={onAdd}>
            <AlertCircle className="w-4 h-4 mr-2" /> Thêm bệnh đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="plant-detail-list-grid">
          {diseases.map((disease) => (
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
    </>
  );
}
