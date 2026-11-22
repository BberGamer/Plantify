import { useCallback, useRef, useState } from "react";
import feedbackService from "../services/feedbackService";
import useScreenScope from "./useScreenScope";
import getErrorMessage from "../utils/getErrorMessage";

export default function useFeedbackDetail(id, manager) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef(null);
  const pending = useRef(false);
  const { capture } = useScreenScope(
    () => { setBusy(false); load(); },
    () => { controller.current?.abort(); },
    id,
  );

  const load = async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    const current = capture();
    setLoading(true);
    setError("");
    try {
      const data = await feedbackService.detail(id, manager, request.signal);
      if (current() && !request.signal.aborted) setItem(data);
    } catch (failure) {
      if (current() && !request.signal.aborted) setError(getErrorMessage(failure, "Không thể tải đóng góp."));
    } finally {
      if (current() && !request.signal.aborted) setLoading(false);
    }
  };

  const review = useCallback(async (status, response) => {
    if (!item || !manager || pending.current) return false;
    if (!response.trim() || response.trim().length > 1000) {
      setMessage("Vui lòng nhập nội dung phản hồi từ 1 đến 1.000 ký tự.");
      return false;
    }
    const current = capture();
    pending.current = true;
    setBusy(true);
    try {
      const updated = await feedbackService.review(id, { status, response, review_count: item.review_count });
      if (!current()) return false;
      setItem(updated);
      setMessage("Đã lưu kết quả xử lý.");
      return true;
    } catch (failure) {
      if (current()) setMessage(getErrorMessage(failure, "Không thể lưu kết quả xử lý."));
      return false;
    } finally {
      pending.current = false;
      if (current()) setBusy(false);
    }
  }, [capture, id, item, manager]);

  return { item, loading, busy, error, load, review, message, clearMessage: () => setMessage("") };
}
