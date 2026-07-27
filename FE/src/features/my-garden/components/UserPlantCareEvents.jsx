// UserPlantCareEvents.jsx - Ghi nhận nhanh và hiển thị lịch sử tưới cây
import { useCallback, useEffect, useState } from "react";
import { Droplets, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createCareEvent,
  deleteCareEvent,
  getCareEvents,
} from "../api";
import { requestNotificationsRefresh } from "@/features/notifications/notification.utils";
import {
  getApiErrorMessage,
  sortCareEvents,
} from "../myGarden.utils";

export function UserPlantCareEvents({
  userPlantId,
  onRecorded,
  readOnly = false,
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCareEvents(userPlantId);
      setEvents(sortCareEvents(
        (response.data || []).filter((event) => event.type === "watering")
      ));
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        "Không thể tải lịch sử tưới cây."
      ));
    } finally {
      setLoading(false);
    }
  }, [userPlantId]);

  useEffect(() => {
    if (userPlantId) load();
  }, [userPlantId, load]);

  const recordWatering = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await createCareEvent(userPlantId, { type: "watering" });
      await load();
      await onRecorded?.();
      requestNotificationsRefresh();
      toast.success("Đã ghi nhận tưới cây.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(
        requestError,
        "Không thể ghi nhận tưới cây."
      ));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (deletingId || saving) return;
    if (!window.confirm("Xóa lần tưới này?")) return;
    setDeletingId(id);
    try {
      await deleteCareEvent(userPlantId, id);
      await load();
      await onRecorded?.();
      requestNotificationsRefresh();
      toast.success("Đã xóa lần tưới.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(
        requestError,
        "Không thể xóa lần tưới."
      ));
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Lịch sử chăm sóc</h3>
        {!readOnly ? (
          <Button
            type="button"
            size="sm"
            onClick={recordWatering}
            disabled={saving || Boolean(deletingId)}
          >
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Droplets className="mr-1 h-4 w-4" />
            )}
            Đã tưới
          </Button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có lần tưới nào.
        </p>
      ) : events.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between gap-3 rounded border p-3"
        >
          <div>
            <p className="font-medium">Đã tưới</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.performedAt).toLocaleString("vi-VN")}
            </p>
            {item.notes ? <p className="text-sm">{item.notes}</p> : null}
          </div>
          {!readOnly ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-destructive"
              disabled={Boolean(deletingId) || saving}
              onClick={() => remove(item._id)}
              aria-label="Xóa lần tưới"
            >
              {deletingId === item._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </div>
      ))}
    </section>
  );
}
