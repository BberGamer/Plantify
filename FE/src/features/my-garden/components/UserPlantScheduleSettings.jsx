import { useEffect, useRef, useState } from "react";
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
import { ScheduleFieldsView } from "@/features/my-garden/components/schedule-settings/ScheduleFieldsView";

const STATUS_LABELS = {
  disabled: "Đã tắt",
  upcoming: "Sắp tới",
  today: "Hôm nay",
  overdue: "Quá hạn",
  invalid: "Chưa cấu hình",
};

function ScheduleFields({
  label,
  scheduleType,
  value,
  onChange,
  readOnly,
  bounds,
  onComplete,
  completing,
}) {
  const status = getUserPlantScheduleStatus(value);

  return (
    <ScheduleFieldsView STATUS_LABELS={STATUS_LABELS} bounds={bounds} completing={completing} label={label} onChange={onChange} onComplete={onComplete} readOnly={readOnly} scheduleType={scheduleType} status={status} value={value} />
  );
}

export function UserPlantScheduleSettings({
  userPlant,
  readOnly = false,
  onChanged,
  onComplete,
}) {
  const [watering, setWatering] = useState(
    normalizeUserPlantSchedule(userPlant?.wateringSchedule)
  );
  const [fertilizing, setFertilizing] = useState(
    normalizeUserPlantSchedule(userPlant?.fertilizingSchedule)
  );
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState({
    watering: false,
    fertilizing: false,
  });
  const completingRef = useRef({
    watering: false,
    fertilizing: false,
  });
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
  const complete = async (scheduleType) => {
    if (completingRef.current[scheduleType]) return;
    completingRef.current[scheduleType] = true;
    setCompleting((current) => ({ ...current, [scheduleType]: true }));
    try {
      await onComplete?.(scheduleType);
      toast.success(
        scheduleType === "watering"
          ? "Đã hoàn thành lịch tưới."
          : "Đã hoàn thành lịch bón phân."
      );
    } catch (requestError) {
      toast.error(getApiErrorMessage(
        requestError,
        "Không thể hoàn thành lịch chăm sóc."
      ));
    } finally {
      completingRef.current[scheduleType] = false;
      setCompleting((current) => ({ ...current, [scheduleType]: false }));
    }
  };

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Cấu hình lịch chăm sóc</h3>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <ScheduleFields
          label="Lịch tưới"
          scheduleType="watering"
          value={watering}
          onChange={setWatering}
          readOnly={readOnly}
          bounds={bounds}
          onComplete={readOnly ? onComplete && complete : null}
          completing={completing.watering}
        />
        <ScheduleFields
          label="Lịch bón phân"
          scheduleType="fertilizing"
          value={fertilizing}
          onChange={setFertilizing}
          readOnly={readOnly}
          bounds={bounds}
          onComplete={readOnly ? onComplete && complete : null}
          completing={completing.fertilizing}
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
