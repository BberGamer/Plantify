// UserPlantCareEvents.jsx - Lịch sử chăm sóc editable hoặc read-only
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createCareEvent,
  deleteCareEvent,
  getCareEvents,
  updateCareEvent,
} from "../api";
import {
  getApiErrorMessage,
  sortCareEvents,
  toLocalDateTimeInput,
  validateCareEventPerformedAt,
} from "../myGarden.utils";

const TYPES = {
  watering: "Tưới nước",
  fertilizing: "Bón phân",
  pruning: "Cắt tỉa",
  repotting: "Thay chậu",
  treatment: "Điều trị",
  observation: "Quan sát",
};

const emptyForm = () => ({
  type: "watering",
  performedAt: toLocalDateTimeInput(),
  notes: "",
});

export function UserPlantCareEvents({
  userPlantId,
  userPlantCreatedAt,
  readOnly = false,
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCareEvents(userPlantId);
      setEvents(sortCareEvents(response.data || []));
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải lịch sử."));
    } finally {
      setLoading(false);
    }
  }, [userPlantId]);

  useEffect(() => {
    if (userPlantId) load();
  }, [userPlantId, load]);

  const save = async () => {
    const validation = validateCareEventPerformedAt(
      form?.performedAt,
      userPlantCreatedAt
    );
    if (validation.error) {
      setFormError(validation.error);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        type: form.type,
        performedAt: validation.performedAt,
        notes: form.notes,
      };
      const response = form._id
        ? await updateCareEvent(userPlantId, form._id, payload)
        : await createCareEvent(userPlantId, payload);
      setEvents((current) => sortCareEvents(
        form._id
          ? current.map((item) => item._id === form._id ? response.data : item)
          : [...current, response.data]
      ));
      setForm(null);
      toast.success("Đã lưu lịch sử chăm sóc.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(
        requestError,
        "Không thể lưu lịch sử."
      ));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Xóa bản ghi chăm sóc này?")) return;
    try {
      await deleteCareEvent(userPlantId, id);
      setEvents((current) => current.filter((item) => item._id !== id));
      toast.success("Đã xóa bản ghi.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(
        requestError,
        "Không thể xóa bản ghi."
      ));
    }
  };

  const openForm = (event = null) => {
    setForm(event
      ? { ...event, performedAt: toLocalDateTimeInput(event.performedAt) }
      : emptyForm());
    setFormError("");
  };

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <div className="flex justify-between">
        <h3 className="font-semibold">Lịch sử chăm sóc</h3>
        {!readOnly ? (
          <Button type="button" size="sm" onClick={() => openForm()}>
            <Plus className="mr-1 h-4 w-4" />
            Thêm
          </Button>
        ) : null}
      </div>

      {form && !readOnly ? (
        <div className="grid gap-2 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
          <select
            className="rounded border p-2"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            {Object.entries(TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <input
            className="rounded border p-2"
            type="datetime-local"
            value={form.performedAt}
            min={userPlantCreatedAt
              ? toLocalDateTimeInput(userPlantCreatedAt)
              : undefined}
            max={toLocalDateTimeInput()}
            onChange={(event) => {
              setForm({ ...form, performedAt: event.target.value });
              setFormError("");
            }}
          />
          <textarea
            className="rounded border p-2 sm:col-span-2"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Ghi chú"
          />
          {formError ? (
            <p className="text-sm text-destructive sm:col-span-2">
              {formError}
            </p>
          ) : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="button" size="sm" onClick={save} disabled={saving}>
              Lưu
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setForm(null)}
            >
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có lịch sử chăm sóc.
        </p>
      ) : events.map((item) => (
        <div key={item._id} className="flex justify-between rounded border p-3">
          <div>
            <p className="font-medium">{TYPES[item.type]}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.performedAt).toLocaleString("vi-VN")}
            </p>
            <p className="text-sm">{item.notes}</p>
          </div>
          {!readOnly ? (
            <div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => openForm(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => remove(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
