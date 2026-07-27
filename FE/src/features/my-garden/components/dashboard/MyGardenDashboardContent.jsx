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

function MyGardenDashboardContent({ ScheduleList, dashboard, onAddPlant, onOpenPlant, overdueItems }) {
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

export { MyGardenDashboardContent };
