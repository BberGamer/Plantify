import { useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateUserPlant } from "../api";
import {
  getApiErrorMessage,
  getScheduleDateBounds,
  getUserPlantScheduleStatus,
  normalizeUserPlantSchedule,
  validateUserPlantSchedule,
} from "../myGarden.utils";

const STATUS_LABELS = {
  disabled: "Đã tắt",
  upcoming: "Sắp tới",
  today: "Hôm nay",
  overdue: "Quá hạn",
  invalid: "Chưa cấu hình",
};

function ScheduleFields({ label, value, onChange, readOnly, bounds }) {
  const status = getUserPlantScheduleStatus(value);

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

export function UserPlantScheduleSettings({
  userPlant,
  readOnly = false,
  onChanged,
}) {
  const [watering, setWatering] = useState(
    normalizeUserPlantSchedule(userPlant?.wateringSchedule)
  );
  const [fertilizing, setFertilizing] = useState(
    normalizeUserPlantSchedule(userPlant?.fertilizingSchedule)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setWatering(normalizeUserPlantSchedule(userPlant?.wateringSchedule));
    setFertilizing(normalizeUserPlantSchedule(userPlant?.fertilizingSchedule));
    setError("");
  }, [
    userPlant?._id,
    userPlant?.wateringSchedule,
    userPlant?.fertilizingSchedule,
  ]);

  const save = async () => {
    const now = new Date();
    const wateringResult = validateUserPlantSchedule(
      watering,
      "Lịch tưới",
      now
    );
    const fertilizingResult = validateUserPlantSchedule(
      fertilizing,
      "Lịch bón phân",
      now
    );
    const validationError = wateringResult.error || fertilizingResult.error;
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await updateUserPlant(userPlant._id, {
        wateringSchedule: wateringResult.value,
        fertilizingSchedule: fertilizingResult.value,
      });
      onChanged?.(response.data);
      toast.success("Đã cập nhật lịch chăm sóc.");
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        "Không thể cập nhật lịch chăm sóc."
      ));
    } finally {
      setSaving(false);
    }
  };

  const bounds = getScheduleDateBounds();

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Cấu hình lịch chăm sóc</h3>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <ScheduleFields
          label="Lịch tưới"
          value={watering}
          onChange={setWatering}
          readOnly={readOnly}
          bounds={bounds}
        />
        <ScheduleFields
          label="Lịch bón phân"
          value={fertilizing}
          onChange={setFertilizing}
          readOnly={readOnly}
          bounds={bounds}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!readOnly ? (
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Lưu lịch chăm sóc
        </Button>
      ) : null}
    </section>
  );
}
