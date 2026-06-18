// PlantOverviewTab.jsx - Tab Tổng quan hiển thị thông số cây (ánh sáng, độ ẩm, nhiệt độ, đất, độc tính)
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Wind, Thermometer, Sprout, AlertCircle } from "lucide-react";

/**
 * PlantOverviewTab - Tab tổng quan với các thông số chăm sóc cây
 */
export function PlantOverviewTab({ plant }) {
  return (
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
  );
}
