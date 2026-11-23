import { useRef, useState } from "react";
import useScreenScope from "./useScreenScope";
import careService from "../services/careService";
import getErrorMessage from "../utils/getErrorMessage";

export const gardenToday = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
export const shiftDay = (day, amount) => new Date(Date.parse(day) + amount * 86400000).toISOString().slice(0, 10);
export default function useCareTasks(from, to = from, plantId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const request = useRef(0);
  const scope = useScreenScope(() => { setTasks([]); setBusy(lock.current); reload(); }, undefined, `${from}:${to}:${plantId || ""}`);
  async function reload() {
    const current = scope.capture();
    const version = ++request.current;
    setLoading(true); setError("");
    try {
      const result = await careService.list({ from, to, ...(plantId ? { user_plant_id: plantId } : {}) });
      if (current() && version === request.current) setTasks(result.data.tasks);
    } catch (e) { if (current() && version === request.current) setError(getErrorMessage(e, "Không tải được lịch chăm sóc.")); }
    finally { if (current() && version === request.current) setLoading(false); }
  }
  async function mutate(action) {
    if (lock.current) return false;
    lock.current = true; setBusy(true); setError("");
    const current = scope.capture();
    try {
      await action();
      if (current()) await reload();
      return current();
    } catch (e) { if (current()) setError(getErrorMessage(e, "Không thể cập nhật lịch chăm sóc.")); return false; }
    finally { lock.current = false; if (scope.isActive()) setBusy(false); }
  }
  return { tasks, loading, error, busy, reload,
    complete: task => mutate(() => careService.complete(task.schedule_id, task.date)),
    create: body => mutate(() => careService.create(body)),
    remove: id => mutate(() => careService.remove(id)),
  };
}
