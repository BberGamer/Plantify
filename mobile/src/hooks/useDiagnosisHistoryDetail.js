import { useCallback, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import diagnosisService from "../services/diagnosisService";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

export default function useDiagnosisHistoryDetail(id) {
  const enabled = useAuthStore(
    (state) => state.isAuthenticated && state.user?.role === "customer",
  );
  const version = useAuthStore((state) => state.sessionVersion);
  const key = `${id}:${version}:${enabled}`;
  const [state, setState] = useState({});
  const pending = useRef(null),
    loadRef = useRef(null);
  const { capture, isActive } = useScreenScope(
    () => loadRef.current?.(),
    () => pending.current?.abort(),
    key,
  );
  const load = useCallback(async () => {
    if (!enabled || !isActive()) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const inScope = capture();
    const current = () => inScope() && !controller.signal.aborted;
    setState({ key, loading: true });
    try {
      const result = await diagnosisService.historyDetail(id, {
        signal: controller.signal,
      });
      if (current()) setState({ key, loading: false, data: result.data });
    } catch (error) {
      if (current())
        setState({
          key,
          loading: false,
          error: getErrorMessage(
            error,
            "Không thể tải chi tiết chẩn đoán. Vui lòng thử lại.",
          ),
        });
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  }, [key, id, enabled, capture, isActive]);
  loadRef.current = load;
  return {
    ...(state.key === key ? state : { loading: true }),
    enabled,
    retry: load,
  };
}
