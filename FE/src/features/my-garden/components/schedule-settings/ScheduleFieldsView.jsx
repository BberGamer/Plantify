import { CalendarClock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ScheduleFieldsView({ STATUS_LABELS, bounds, completing, label, onChange, onComplete, readOnly, scheduleType, status, value }) {
  return (
<div className="space-y-3 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{label}</p>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">
          {STATUS_LABELS[status]}
        </span>
      </div>

      {readOnly ? (
        value.enabled ? (
          <div className="space-y-3">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Chu kỳ: {value.frequencyDays} ngày</p>
              <p>
                Lần tiếp theo:{" "}
                {value.nextDueAt
                  ? new Date(value.nextDueAt).toLocaleString("vi-VN")
                  : "Chưa xác định"}
              </p>
              <p>
                Hoàn thành gần nhất:{" "}
                {value.lastCompletedAt
                  ? new Date(value.lastCompletedAt).toLocaleString("vi-VN")
                  : "Chưa có"}
              </p>
            </div>
            {onComplete ? (
              <Button
                type="button"
                size="sm"
                onClick={() => onComplete(scheduleType)}
                disabled={completing}
              >
                {completing ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                Hoàn thành
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Lịch này đang được tắt.
          </p>
        )
      ) : (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.enabled}
              onChange={(event) => onChange({
                ...value,
                enabled: event.target.checked,
              })}
            />
            Bật lịch chăm sóc
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Chu kỳ (ngày)</span>
              <input
                className="w-full rounded border p-2"
                type="number"
                min="1"
                max="365"
                step="1"
                disabled={!value.enabled}
                value={value.frequencyDays}
                onChange={(event) => onChange({
                  ...value,
                  frequencyDays: event.target.value,
                })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Lần nhắc tiếp theo</span>
              <input
                className="w-full rounded border p-2"
                type="datetime-local"
                step="1"
                min={bounds.min}
                max={bounds.max}
                disabled={!value.enabled}
                value={value.nextDueAt}
                onChange={(event) => onChange({
                  ...value,
                  nextDueAt: event.target.value,
                })}
              />
            </label>
          </div>
          {value.lastCompletedAt ? (
            <p className="text-xs text-muted-foreground">
              Hoàn thành gần nhất:{" "}
              {new Date(value.lastCompletedAt).toLocaleString("vi-VN")}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export { ScheduleFieldsView };
