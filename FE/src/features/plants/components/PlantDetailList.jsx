// PlantDetailList.jsx - Component hiển thị danh sách Care Guides và Diseases
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Droplets, Leaf, AlertCircle, Scissors, Sprout, RefreshCw, Bug } from "lucide-react";

/**
 * CareGuideList - Danh sách Care Guides
 */
export function CareGuideList({ careGuides, loading }) {
  return (
    <>
      <div className="plant-detail-tab-header">
        <h2 className="plant-detail-tab-title">Danh sách Hướng dẫn chăm sóc</h2>
      </div>

      {loading ? (
        <div className="plant-detail-loading">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : careGuides.length === 0 ? (
        <Card className="plant-detail-empty">
          <Leaf className="w-12 h-12 text-muted-foreground plant-detail-empty-icon" />
          <p className="plant-detail-empty-text">Chưa có hướng dẫn chăm sóc nào cho cây này.</p>
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
export function DiseaseList({ diseases, loading }) {
  return (
    <>
      <div className="plant-detail-tab-header">
        <h2 className="plant-detail-tab-title">Bệnh thường gặp</h2>
      </div>

      {loading ? (
        <div className="plant-detail-loading">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : diseases.length === 0 ? (
        <Card className="plant-detail-empty">
          <Bug className="w-12 h-12 text-muted-foreground plant-detail-empty-icon" />
          <p className="plant-detail-empty-text">Chưa có thông tin bệnh cho cây này.</p>
        </Card>
      ) : (
        <div className="plant-detail-list-grid">
          {diseases.map((disease) => (
            <Card key={disease._id} className="plant-detail-card flex flex-col justify-between">
              <div>
                <div className="plant-detail-card-header">
                  <div className="plant-detail-card-title">
                    <Bug className="w-5 h-5 plant-detail-disease-icon" />
                    <h3>{disease.name}</h3>
                  </div>
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
                {disease.prevention && (
                  <div className="plant-detail-card-content">
                    <span className="plant-detail-card-label font-medium text-emerald-600">Phòng ngừa: </span>
                    {disease.prevention}
                  </div>
                )}
              </div>
              {Array.isArray(disease.images) && disease.images.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/40">
                  <div className="text-xs text-muted-foreground font-medium mb-1.5">Hình ảnh thực tế:</div>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-muted">
                    {disease.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 hover:opacity-90 transition-opacity shadow-sm cursor-zoom-in"
                        onClick={() => window.open(imgUrl, "_blank")}
                      >
                        <img
                          src={imgUrl}
                          alt={`${disease.name} ${idx + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='10'%3EẢnh lỗi%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
