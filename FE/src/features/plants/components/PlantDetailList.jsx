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
export function CareGuideList({ careGuides, loading }) {
  return (
    <>
      <div className="plant-detail-tab-header">
        <h2 className="plant-detail-tab-title">Danh sách Care Guides</h2>
      </div>

      {loading ? (
        <div className="plant-detail-loading">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : careGuides.length === 0 ? (
        <Card className="plant-detail-empty">
          <Leaf className="w-12 h-12 text-muted-foreground plant-detail-empty-icon" />
          <p className="plant-detail-empty-text">Chưa có Care Guide nào cho cây này.</p>
        </Card>
      ) : (
        <div className="care-guide-list-vertical">
          {careGuides.map((cg, index) => {
            const items = [
              {
                id: "watering",
                title: "Tưới nước",
                icon: Droplets,
                color: "text-blue-500",
                content: cg.watering,
              },
              {
                id: "pruning",
                title: "Cắt tỉa",
                icon: Scissors,
                color: "text-orange-500",
                content: cg.pruning,
              },
              {
                id: "propagation",
                title: "Nhân giống",
                icon: Sprout,
                color: "text-green-500",
                content: cg.propagation,
              },
              {
                id: "repotting",
                title: "Thay chậu",
                icon: RefreshCw,
                color: "text-violet-500",
                content: cg.repotting,
              },
            ];

            return (
              <div key={cg._id || index} className="care-guide-group">
                <h4 className="care-guide-group-title">Hướng dẫn chăm sóc #{index + 1}</h4>
                <div className="care-guide-group-items">
                  {items
                    .filter((item) => item.content)
                    .map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Card key={`${cg._id}-${item.id}`} className="care-guide-item-card">
                          <div className="care-guide-item-header">
                            <IconComponent className={`care-guide-item-icon ${item.color}`} />
                            <h3 className="care-guide-item-title">{item.title}</h3>
                          </div>
                          <div className="care-guide-item-content">
                            {item.content}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            );
          })}
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
