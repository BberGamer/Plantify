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
    <section className="space-y-3" aria-label="Dashboard My Garden">
      <h2 className="text-lg font-semibold">Tổng quan chăm sóc</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Sprout className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{dashboard.totalPlants}</p>
              <p className="text-sm text-muted-foreground">Tổng số cây</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="flex items-center gap-2 font-medium">
              <Droplets className="h-5 w-5 text-sky-500" />
              Cần tưới hôm nay ({dashboard.wateringDueToday.length})
            </div>
            <ScheduleList
              items={dashboard.wateringDueToday}
              emptyText="Không có cây cần tưới."
              onOpenPlant={onOpenPlant}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="flex items-center gap-2 font-medium">
              <FlaskConical className="h-5 w-5 text-emerald-600" />
              Cần bón phân hôm nay ({dashboard.fertilizingDueToday.length})
            </div>
            <ScheduleList
              items={dashboard.fertilizingDueToday}
              emptyText="Không có cây cần bón phân."
              onOpenPlant={onOpenPlant}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="flex items-center gap-2 font-medium">
              <TriangleAlert className="h-5 w-5 text-amber-600" />
              Quá hạn ({dashboard.overduePlants.length})
            </div>
            <ScheduleList
              items={overdueItems}
              emptyText="Không có lịch bị quá hạn."
              onOpenPlant={onOpenPlant}
            />
          </CardContent>
        </Card>
      </div>
      <Card className="border-dashed border-primary/40 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-7 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Thêm cây vào khu vườn</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi lịch tưới, bón phân và nhận cảnh báo chăm sóc phù hợp.
            </p>
          </div>
          <Button type="button" onClick={onAddPlant}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm cây
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
