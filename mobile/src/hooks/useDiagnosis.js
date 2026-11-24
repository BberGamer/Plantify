import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import diagnosisService from "../services/diagnosisService";
import { getSessionContext } from "../services/sessionAccess";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

const invalidResult = (
  reason,
  message = getErrorMessage({ code: "DIAGNOSIS_INVALID_PHOTO" }),
) => ({
  status: "unrecognized",
  result_status: "invalid_image",
  reason,
  message,
  prediction: null,
  alternatives: [],
  diagnosis_id: null,
});

export default function useDiagnosis(
  photo,
  operationLock,
  identification = false,
) {
  const version = useAuthStore((state) => state.sessionVersion);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageInvalid, setImageInvalid] = useState(false);
  const pending = useRef(null);
  const latestPhoto = useRef(photo);
  latestPhoto.current = photo;

  function cancelRequest() {
    const controller = pending.current;
    controller?.abort();
    pending.current = null;
    if (operationLock.current === controller) operationLock.current = null;
  }
  function invalidate() {
    cancelRequest();
    setBusy(false);
    setResult(null);
    setError("");
  }

  const { capture, isActive } = useScreenScope(
    undefined,
    () => invalidate(),
    photo,
  );
  useEffect(() => {
    invalidate();
    setImageInvalid(false);
    return cancelRequest;
  }, [photo, version, identification]);

  async function analyze() {
    if (
      !photo ||
      imageInvalid ||
      pending.current ||
      operationLock.current ||
      !isActive()
    )
      return;
    const context = getSessionContext();
    if (!context.token) {
      setError("Vui lòng đăng nhập để phân tích ảnh.");
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    operationLock.current = controller;
    const current = capture();
    const selected = photo;
    const isCurrent = () =>
      current() &&
      !controller.signal.aborted &&
      latestPhoto.current === selected;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await diagnosisService.analyze(selected, {
        identification,
        sessionContext: context,
        signal: controller.signal,
      });
      if (!isCurrent()) return;
      setResult({ photo: selected, data: response.data });
    } catch (failure) {
      if (isCurrent()) {
        if (failure?.diagnosisResult) {
          setImageInvalid(true);
          setResult({
            photo: selected,
            data: failure.diagnosisResult,
          });
          return;
        }
        setError(
          getErrorMessage(
            failure,
            "Không thể phân tích ảnh. Vui lòng thử lại.",
          ),
        );
      }
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        if (operationLock.current === controller) operationLock.current = null;
        if (current()) setBusy(false);
      }
    }
  }

  const clearResult = () => {
    if (pending.current || operationLock.current) return;
    setResult(null);
    setError("");
  };
  const onImageError = () => {
    if (!photo || latestPhoto.current !== photo || !isActive()) return;
    invalidate();
    setImageInvalid(true);
    setResult({ photo, data: invalidResult("DIAGNOSIS_INVALID_PHOTO") });
  };
  return {
    result: result?.photo === photo ? result.data : null,
    busy,
    error,
    imageInvalid,
    analyze,
    clearResult,
    onImageError,
  };
}
