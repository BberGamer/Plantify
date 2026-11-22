import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { randomUUID } from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import useScreenScope from "./useScreenScope";
import diagnosisService from "../services/diagnosisService";
import feedbackService, { feedbackPhotoError, MAX_FEEDBACK_IMAGES } from "../services/feedbackService";
import getErrorMessage from "../utils/getErrorMessage";

export default function useFeedbackForm(initialId) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(!!initialId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef(false);
  const requestKey = useRef(null);
  const { capture, isActive } = useScreenScope(() => setBusy(false));

  useEffect(() => {
    if (!initialId) return;
    const controller = new AbortController();
    setLoadingDiagnosis(true);
    diagnosisService.historyDetail(initialId, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setDiagnosis(result.data); })
      .catch(error => { if (!controller.signal.aborted) setMessage(getErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoadingDiagnosis(false); });
    return () => controller.abort();
  }, [initialId]);

  function changeDescription(value) {
    requestKey.current = null;
    setDescription(value);
  }

  function selectDiagnosis(value) {
    requestKey.current = null;
    setDiagnosis(value);
  }

  function removeImage(index) {
    requestKey.current = null;
    setImages(previous => previous.filter((_, position) => position !== index));
  }

  async function pickImages() {
    if (pending.current || !isActive() || images.length >= MAX_FEEDBACK_IMAGES) return;
    const current = capture();
    pending.current = true;
    try {
      const remaining = MAX_FEEDBACK_IMAGES - images.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 1,
      });
      if (!current() || result.canceled) return;
      if (result.assets.length > remaining) return setMessage("Chỉ được đính kèm tối đa 5 ảnh.");
      const error = result.assets.map(asset => feedbackPhotoError(asset)).find(Boolean);
      if (error) return setMessage(error);
      requestKey.current = null;
      setImages(previous => [...previous, ...result.assets]);
    } catch {
      if (current()) setMessage("Không thể mở thư viện ảnh.");
    } finally {
      pending.current = false;
    }
  }

  async function submit() {
    if (pending.current || !isActive() || loadingDiagnosis) return;
    const text = description.trim();
    if (!text || text.length > 250) return setMessage("Vui lòng nhập mô tả từ 1 đến 250 ký tự.");
    if (!images.length || images.length > MAX_FEEDBACK_IMAGES)
      return setMessage("Vui lòng đính kèm từ 1 đến 5 ảnh.");
    const current = capture();
    pending.current = true;
    setBusy(true);
    try {
      requestKey.current ??= randomUUID();
      const result = await feedbackService.create({
        description: text,
        diagnosisId: diagnosis?._id,
        images,
        key: requestKey.current,
      });
      if (current()) router.replace({ pathname: "/customer/feedback/[id]", params: { id: result._id, sent: "1" } });
    } catch (error) {
      if (current()) setMessage(getErrorMessage(error, "Không thể gửi đóng góp. Vui lòng thử lại."));
    } finally {
      pending.current = false;
      if (current()) setBusy(false);
    }
  }

  return {
    description, changeDescription, images, pickImages, removeImage, diagnosis, selectDiagnosis,
    loadingDiagnosis, busy, submit, message, clearMessage: () => setMessage(""),
  };
}
