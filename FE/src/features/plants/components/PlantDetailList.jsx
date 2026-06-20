// PlantDetailList.jsx - Component hiển thị danh sách Care Guides và Diseases
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Droplets, Leaf, AlertCircle, Scissors, Sprout, RefreshCw } from "lucide-react";

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
            <Card key={cg._id} className="plant-detail-card">
              <div className="plant-detail-card-header">
                <div className="plant-detail-card-title">
                  <Droplets className="w-5 h-5" />
                  <h3>Hướng dẫn chăm sóc</h3>
                </div>
              </div>
              <div className="plant-detail-card-meta">
                {cg.watering && (
                  <div className="plant-detail-card-meta-item">
                    <Droplets className="text-blue-400" />
                    Tưới: {cg.watering}
                  </div>
                )}
                {cg.propagation && (
                  <div className="plant-detail-card-meta-item">
                    <Sprout className="text-green-500" />
                    Nhân giống: {cg.propagation}
                  </div>
                )}
                {cg.pruning && (
                  <div className="plant-detail-card-meta-item">
                    <Scissors className="text-orange-400" />
                    Cắt tỉa: {cg.pruning}
                  </div>
                )}
                {cg.repotting && (
                  <div className="plant-detail-card-meta-item">
                    <RefreshCw className="text-violet-400" />
                    Thay chậu: {cg.repotting}
                  </div>
                )}
              </div>
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
