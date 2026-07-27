// DiseaseListContent.jsx - Hiển thị danh sách bệnh liên quan trong chi tiết cây
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Bug } from "lucide-react";

function DiseaseListContent({ diseases, formatKnowledgeList, loading, openImagePreview, selectedDiseaseName, selectedImage, setSelectedImage }) {
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
                {formatKnowledgeList(disease.symptoms) && (
                  <div className="plant-detail-card-content">
                    <span className="plant-detail-card-label">Triệu chứng: </span>
                    {formatKnowledgeList(disease.symptoms)}
                  </div>
                )}
                {formatKnowledgeList(disease.causes) && (
                  <div className="plant-detail-card-content">
                    <span className="plant-detail-card-label">Nguyên nhân: </span>
                    {formatKnowledgeList(disease.causes)}
                  </div>
                )}
                {formatKnowledgeList(disease.treatments ?? disease.treatment) && (
                  <div className="plant-detail-card-content">
                    <span className="plant-detail-card-treatment">Điều trị: </span>
                    {formatKnowledgeList(disease.treatments ?? disease.treatment)}
                  </div>
                )}
                {formatKnowledgeList(disease.preventions ?? disease.prevention) && (
                  <div className="plant-detail-card-content">
                    <span className="plant-detail-card-label font-medium text-emerald-600">Phòng ngừa: </span>
                    {formatKnowledgeList(disease.preventions ?? disease.prevention)}
                  </div>
                )}
              </div>
              {Array.isArray(disease.images) && disease.images.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/40">
                  <div className="text-xs text-muted-foreground font-medium mb-1.5">Hình ảnh thực tế:</div>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-muted">
                    {disease.images.map((imgUrl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 transition-opacity shadow-sm cursor-zoom-in hover:opacity-90"
                        onClick={() => openImagePreview(imgUrl, disease.name)}
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
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage("")}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Ảnh bệnh cây {selectedDiseaseName}</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl bg-background">
            <img
              src={selectedImage}
              alt={selectedDiseaseName}
              className="max-h-[80vh] w-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23f0f0f0' width='600' height='400'/%3E%3Ctext x='300' y='205' text-anchor='middle' fill='%23999' font-size='20'%3EẢnh lỗi%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { DiseaseListContent };
