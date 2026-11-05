import { useCallback, useRef, useState } from "react";
import gardenService from "../services/gardenService";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

export default function useGardenPlant(id) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);
  const loadRef = useRef(null);
  const { capture, isActive } = useScreenScope(
    () => loadRef.current?.(),
    () => ++request.current,
    id,
  );
  const load = useCallback(async () => {
    if (!id || !isActive()) return;
    const requestId = ++request.current;
    const inScope = capture();
    const isCurrent = () => inScope() && requestId === request.current;
    setLoading(true);
    setError("");
    try {
      const response = await gardenService.getPlant(id);
      if (response?.success !== true || !response.data?._id)
        throw Object.assign(new Error("Dữ liệu cây không hợp lệ."), { code: "INVALID_RESPONSE" });
      if (isCurrent()) setPlant(response.data);
    } catch (failure) {
      if (isCurrent()) setError(getErrorMessage(failure, "Không thể tải thông tin cây."));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [capture, id, isActive]);
  loadRef.current = load;
  return { plant, loading, error, retry: load };
}
