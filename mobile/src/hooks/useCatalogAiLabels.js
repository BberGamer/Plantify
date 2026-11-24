import { useEffect, useState } from "react";
import api from "../services/api";
import useAuthStore from "../../store/authStore";
import getErrorMessage from "../utils/getErrorMessage";

export default function useCatalogAiLabels(kind, visible, targetId) {
  const sessionVersion = useAuthStore(state => state.sessionVersion);
  const [state, setState] = useState({ key: null, rows: [], selected: [], error: "" });
  const [attempt, setAttempt] = useState(0);
  const key = `${kind}:${targetId || "new"}:${sessionVersion}:${attempt}`;
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    let current = true;
    const load = async () => {
      try {
        const response = await api.get(`/${kind === "plant" ? "plants" : "diseases"}/manager/ai-labels`, {
          signal: controller.signal,
        });
        const rows = response.data?.data;
        if (response.data?.success !== true || !Array.isArray(rows) || rows.some(row =>
          !Number.isInteger(row.class_id) || typeof row.class_name !== "string"))
          throw new Error("Dữ liệu nhãn AI không hợp lệ.");
        if (!current) return;
        setState({ key, rows, error: "", selected: rows.filter(row =>
          targetId && row[kind === "plant" ? "plant_id" : "disease_id"] === targetId,
        ).map(row => row.class_id) });
      } catch (error) {
        if (current) setState({ key, rows: [], selected: [], error: getErrorMessage(error, "Không tải được nhãn AI.") });
      }
    };
    load();
    return () => { current = false; controller.abort(); };
  }, [kind, visible, targetId, sessionVersion, attempt, key]);
  // Mở lại form phải tải assignment mới, kể cả khi đang sửa cùng bản ghi.
  useEffect(() => { if (!visible) setState({ key: null, rows: [], selected: [], error: "" }); }, [visible]);
  const ready = visible && state.key === key && !state.error;
  return {
    rows: state.rows, selected: state.selected, error: state.error,
    loading: visible && state.key !== key, ready, targetId, kind,
    retry: () => setAttempt(value => value + 1),
    toggle: id => {
      if (ready) setState(previous => ({ ...previous,
        selected: previous.selected.includes(id) ? previous.selected.filter(value => value !== id) : [...previous.selected, id],
      }));
    },
  };
}
