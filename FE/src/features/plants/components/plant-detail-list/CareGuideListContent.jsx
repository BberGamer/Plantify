import { Card } from "@/components/ui/card";
import { Loader2, Droplets, Leaf, AlertCircle, Scissors, Sprout, RefreshCw, Bug } from "lucide-react";

function CareGuideListContent({ careGuides, loading }) {
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

export { CareGuideListContent };
