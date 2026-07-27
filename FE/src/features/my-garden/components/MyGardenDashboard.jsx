import { useEffect, useState } from "react";
import {
  AlertCircle,
  Droplets,
  FlaskConical,
  Loader2,
  Plus,
  Sprout,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyGardenDashboard } from "../api";
import {
  getApiErrorMessage,
  getUserPlantImage,
  handleUserPlantImageError,
} from "../myGarden.utils";
import { MyGardenDashboardContent } from "@/features/my-garden/components/dashboard/MyGardenDashboardContent";

function PlantLink({ plant, onOpenPlant, detail }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto w-full justify-start gap-3 px-2 py-2 text-left"
      onClick={() => onOpenPlant(plant._id)}
    >
      <img
        src={getUserPlantImage(plant)}
        alt=""
        onError={handleUserPlantImageError}
        className="h-10 w-10 shrink-0 rounded-lg border object-cover"
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{plant.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {detail}
        </span>
      </span>
    </Button>
  );
}

function ScheduleList({ items, emptyText, onOpenPlant }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  return (
    <div className="space-y-1">
      {items.map((plant) => (
        <PlantLink
          key={`${plant._id}:${plant.scheduleType}`}
          plant={plant}
          onOpenPlant={onOpenPlant}
          detail={new Date(plant.nextDueAt).toLocaleString("vi-VN")}
        />
      ))}
    </div>
  );
}

export function MyGardenDashboard({
  refreshKey = 0,
  onOpenPlant,
  onAddPlant,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError("");
    getMyGardenDashboard(controller.signal)
      .then((response) => {
        if (!cancelled) setDashboard(response.data);
      })
      .catch((requestError) => {
        if (!cancelled && requestError.code !== "ERR_CANCELED") {
          setError(getApiErrorMessage(
            requestError,
            "Không thể tải dashboard My Garden."
          ));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tổng hợp khu vườn...
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex items-center gap-2 py-5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </CardContent>
      </Card>
    );
  }
  if (!dashboard) return null;

  const overdueItems = dashboard.overduePlants.flatMap((plant) => (
    plant.dueSchedules.map((schedule) => ({
      ...plant,
      scheduleType: schedule.type,
      nextDueAt: schedule.nextDueAt,
    }))
  ));
  return (
    <MyGardenDashboardContent ScheduleList={ScheduleList} dashboard={dashboard} onAddPlant={onAddPlant} onOpenPlant={onOpenPlant} overdueItems={overdueItems} />
  );
}
