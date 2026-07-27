// UserPlantCareEvents.jsx - Ghi nhận nhanh và hiển thị lịch sử tưới cây
import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteCareEvent,
  getCareEvents,
} from "../api";
import { requestNotificationsRefresh } from "@/features/notifications/notification.utils";
import {
  getApiErrorMessage,
  sortCareEvents,
} from "../myGarden.utils";

/** Tải, ghi nhận và xóa lịch sử chăm sóc của cây theo quyền hiện tại. @param {Object} props - Component props. @returns {JSX.Element} Khu vực sự kiện chăm sóc. */
export function UserPlantCareEvents({
  userPlantId,
  onRecorded,
  readOnly = false,
  refreshKey = 0,
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCareEvents(userPlantId);
      setEvents(sortCareEvents(
        (response.data || []).filter(
          (event) => ["watering", "fertilizing"].includes(event.type)
        )
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
  }, [userPlantId, load, refreshKey]);

  const remove = async (id) => {
    if (deletingId) return;
    if (!window.confirm("Xóa hành động này?")) return;
    setDeletingId(id);
    try {
      await deleteCareEvent(userPlantId, id);
      await load();
      await onRecorded?.();
      requestNotificationsRefresh();
      toast.success("Đã xóa.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(
        requestError,
        "Không thể xóa."
      ));
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Lịch sử chăm sóc</h3>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có lịch sử chăm sóc.
        </p>
      ) : events.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between gap-3 rounded border p-3"
        >
          <div>
            <p className="font-medium">
              {item.type === "watering" ? "Đã tưới" : "Đã bón phân"}
            </p>
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
              disabled={Boolean(deletingId)}
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
