import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import diagnosisService from "../services/diagnosisService";
import { getSessionContext } from "../services/sessionAccess";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

const MESSAGES = {
  DIAGNOSIS_INVALID_PHOTO:
    "Không đọc được ảnh. Vui lòng chụp hoặc chọn ảnh khác.",
  DIAGNOSIS_IMAGE_TOO_LARGE: "Ảnh tối đa 10 MB. Vui lòng chọn ảnh nhỏ hơn.",
  DIAGNOSIS_UNSUPPORTED_IMAGE: "Vui lòng chọn ảnh JPG, PNG hoặc WebP tĩnh.",
  DIAGNOSIS_TIMEOUT:
    "Phân tích ảnh quá lâu. Ảnh vẫn được giữ lại; bạn có thể thử lại.",
  DIAGNOSIS_BUSY:
    "Dịch vụ đang xử lý ảnh khác. Vui lòng chờ một chút rồi thử lại.",
  DIAGNOSIS_UNAVAILABLE:
    "Chưa kết nối được dịch vụ nhận diện. Vui lòng thử lại sau.",
  DIAGNOSIS_INVALID_RESPONSE:
    "Dịch vụ trả kết quả chưa hợp lệ. Vui lòng thử lại.",
  DIAGNOSIS_CATALOG_UNAVAILABLE:
    "Chưa tải được thông tin cây/bệnh. Vui lòng thử lại sau.",
  DIAGNOSIS_NOT_CONFIGURED:
    "Dịch vụ nhận diện chưa được cấu hình. Vui lòng thử lại sau.",
  INVALID_UPLOAD:
    "Vui lòng chọn một ảnh JPG, PNG hoặc WebP tĩnh, tối đa 10 MB.",
  IMAGE_TOO_LARGE: "Ảnh tối đa 10 MB. Vui lòng chọn ảnh nhỏ hơn.",
  IMAGE_DIMENSIONS_TOO_LARGE:
    "Ảnh tối đa 25 megapixel. Vui lòng giảm kích thước ảnh.",
  UNSUPPORTED_IMAGE: "Vui lòng chọn ảnh JPG, PNG hoặc WebP tĩnh.",
  ANIMATED_IMAGE: "Chưa hỗ trợ ảnh động. Vui lòng chọn ảnh tĩnh.",
  INVALID_IMAGE:
    "Ảnh hỏng hoặc không đọc được. Vui lòng chụp hoặc chọn ảnh khác.",
  INFERENCE_BUSY: "Dịch vụ đang xử lý ảnh khác. Vui lòng thử lại sau.",
};

// Mục đích: Quản lý trạng thái phân tích ảnh của màn hình.
// Cách chạy: Giữ loading, kết quả, lỗi và hủy request khi ảnh, phiên hoặc màn hình đổi.
export default function useDiagnosis(photo, operationLock, identification = false) {
  const version = useAuthStore((state) => state.sessionVersion);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageInvalid, setImageInvalid] = useState(false);
  const pending = useRef(null);
  const latestPhoto = useRef(photo);
  latestPhoto.current = photo;

  // Mục đích: Vô hiệu hóa lần phân tích hiện tại.
  // Cách chạy: Hủy request, mở khóa và xóa kết quả/lỗi nếu được yêu cầu.
  function invalidate(clear = true) {
    const controller = pending.current;
    controller?.abort();
    pending.current = null;
    if (operationLock.current === controller) operationLock.current = null;
    setBusy(false);
    if (clear) {
      setResult(null);
      setError("");
    }
  }
  const { capture, isActive } = useScreenScope(
    undefined,
    () => invalidate(),
    photo,
  );
  // Mục đích: Dọn lần phân tích khi ảnh hoặc phiên thay đổi.
  // Cách chạy: Xóa trạng thái cũ; hàm cleanup hủy request và mở khóa khi effect kết thúc.
  useEffect(() => {
    invalidate();
    setImageInvalid(false);
    // Mục đích: Ngừng dùng request của ảnh hoặc phiên cũ.
    // Cách chạy: Hủy controller đang chờ và giải phóng khóa do controller đó giữ.
    return () => {
      const controller = pending.current;
      controller?.abort();
      pending.current = null;
      if (operationLock.current === controller) operationLock.current = null;
    };
  }, [photo, version]);

  // Mục đích: Bắt đầu phân tích ảnh đang chọn.
  // Cách chạy: Khóa thao tác, gửi ảnh và chỉ cập nhật nếu ảnh cùng phiên vẫn còn hiệu lực.
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
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await diagnosisService.analyze(selected, {
        identification,
        sessionContext: context,
        signal: controller.signal,
      });
      if (
        !current() ||
        controller.signal.aborted ||
        latestPhoto.current !== selected
      )
        return;
      setResult({ photo: selected, data: response.data });
    } catch (failure) {
      if (
        current() &&
        !controller.signal.aborted &&
        latestPhoto.current === selected
      ) {
        const code = failure?.response?.data?.code || failure?.code;
        setError(
          MESSAGES[code] ||
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

  // Mục đích: Quay lại phần xem ảnh.
  // Cách chạy: Xóa kết quả và lỗi khi không có thao tác đang chạy.
  const clearResult = () => {
    if (pending.current || operationLock.current) return;
    setResult(null);
    setError("");
  };
  // Mục đích: Xử lý ảnh không hiển thị được.
  // Cách chạy: Hủy phân tích, đánh dấu ảnh lỗi và yêu cầu chọn lại.
  const onImageError = () => {
    invalidate();
    setImageInvalid(true);
    setError("Không đọc được ảnh. Vui lòng chụp hoặc chọn ảnh khác.");
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
