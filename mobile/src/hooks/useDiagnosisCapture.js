import { useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import useAuthStore from "../../store/authStore";
import useScreenScope from "./useScreenScope";

// Mục đích: Quản lý camera và ảnh được chọn.
// Cách chạy: Theo dõi quyền, trạng thái app và phiên; trả ảnh cùng các thao tác chụp/chọn.
export default function useDiagnosisCapture(operationLock) {
  const [permission, requestPermission, refreshPermission] =
    useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === "active",
  );
  const [cameraError, setCameraError] = useState("");
  const [error, setError] = useState("");
  const camera = useRef(null);
  const pending = useRef(null);
  const version = useAuthStore((state) => state.sessionVersion);
  const { capture, isActive } = useScreenScope(
    // Mục đích: Đánh dấu màn chụp đang được mở.
    // Cách chạy: Bật focused khi màn hình nhận focus.
    () => setFocused(true),
    // Mục đích: Dọn trạng thái khi rời màn chụp.
    // Cách chạy: Bỏ thao tác đang theo dõi, mở khóa của nó và tắt camera sẵn sàng.
    () => {
      if (operationLock?.current === pending.current)
        operationLock.current = null;
      pending.current = null;
      setFocused(false);
      setBusy(false);
      setReady(false);
    },
  );

  // Mục đích: Không giữ ảnh từ phiên đăng nhập cũ.
  // Cách chạy: Xóa ảnh và lỗi mỗi khi sessionVersion thay đổi.
  useEffect(() => {
    setPhoto(null);
    setError("");
    setCameraError("");
  }, [version]);

  // Mục đích: Đồng bộ camera với trạng thái mở hoặc ẩn của app.
  // Cách chạy: Theo dõi AppState và bỏ đăng ký khi effect kết thúc.
  useEffect(() => {
    // Mục đích: Cập nhật camera khi app đổi trạng thái.
    // Cách chạy: Đặt foreground, reset ready và kiểm tra lại quyền khi trở về app.
    const subscription = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      setReady(false);
      if (state === "active" && isActive() && Platform.OS !== "web") {
        void refreshPermission().catch(() => {});
      }
    });
    // Mục đích: Dừng theo dõi AppState khi không còn cần.
    // Cách chạy: Gỡ listener của effect hiện tại.
    return () => subscription.remove();
  }, [isActive, refreshPermission]);

  // Chỉ thao tác còn thuộc màn hình/phiên hiện tại được cập nhật ảnh và trạng thái.
  // Mục đích: Chạy một thao tác camera/album an toàn.
  // Cách chạy: Khóa gửi trùng, kiểm tra màn hình còn hiệu lực và mở khóa khi hoàn tất.
  const run = async (operation) => {
    if (pending.current || operationLock?.current || !isActive()) return;
    const attempt = {};
    pending.current = attempt;
    if (operationLock) operationLock.current = attempt;
    const current = capture();
    setBusy(true);
    setError("");
    try {
      await operation(current);
    } catch {
      if (current()) setError("Không thể mở hoặc chụp ảnh. Vui lòng thử lại.");
    } finally {
      if (pending.current === attempt) {
        pending.current = null;
        if (operationLock?.current === attempt) operationLock.current = null;
        if (current()) setBusy(false);
      }
    }
  };

  // Mục đích: Lưu ảnh hợp lệ vào màn hình.
  // Cách chạy: Kiểm tra URI, kích thước và ngữ cảnh rồi lưu metadata ảnh vào state.
  const acceptPhoto = (asset, source, current) => {
    if (!current()) return;
    if (!asset?.uri || !(asset.width > 0) || !(asset.height > 0)) {
      throw new Error("INVALID_IMAGE");
    }
    setReady(false);
    setPhoto({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      source,
    });
  };

  // Mục đích: Chọn một ảnh từ album.
  // Cách chạy: Mở system picker và nhận ảnh nếu người dùng không hủy.
  const pickPhoto = () =>
    run(async (current) => {
      // System picker chọn một ảnh, không cần xin quyền đọc toàn bộ thư viện.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        allowsEditing: false,
        quality: 0.9,
        exif: false,
      });
      if (!result.canceled) acceptPhoto(result.assets?.[0], "library", current);
    });

  // Mục đích: Chụp ảnh bằng camera.
  // Cách chạy: Chỉ chụp khi camera sẵn sàng và app đang mở, rồi lưu ảnh nhận được.
  const takePhoto = () => {
    if (!ready || !foreground || !camera.current) return;
    return run(async (current) => {
      const asset = await camera.current.takePictureAsync({
        quality: 0.9,
        exif: false,
      });
      acceptPhoto(asset, "camera", current);
    });
  };

  // Mục đích: Xin quyền sử dụng camera.
  // Cách chạy: Mở cài đặt nếu không thể hỏi lại; trường hợp khác hiện yêu cầu cấp quyền.
  const enableCamera = () =>
    run(async (current) => {
      if (permission && !permission.granted && !permission.canAskAgain) {
        await Linking.openSettings();
      } else {
        await requestPermission();
        if (current()) setCameraError("");
      }
    });

  // Mục đích: Bỏ ảnh hiện tại để chụp lại.
  // Cách chạy: Khi không bận, xóa ảnh, lỗi và trạng thái camera sẵn sàng.
  const retake = () => {
    if (pending.current || operationLock?.current || !isActive()) return;
    setPhoto(null);
    setReady(false);
    setError("");
    setCameraError("");
  };

  return {
    camera,
    photo,
    busy,
    error,
    cameraError,
    permission,
    showCamera:
      Platform.OS !== "web" &&
      focused &&
      foreground &&
      permission?.granted === true &&
      !photo &&
      !cameraError,
    canCapture: ready && foreground && !busy,
    takePhoto,
    pickPhoto,
    enableCamera,
    retake,
    // Mục đích: Cho phép chụp khi camera đã khởi tạo.
    // Cách chạy: Đặt ready khi màn hình vẫn còn hiệu lực.
    onCameraReady: () => {
      if (isActive()) setReady(true);
    },
    // Mục đích: Thông báo lỗi khởi tạo camera.
    // Cách chạy: Tắt trạng thái sẵn sàng và hướng dẫn chọn ảnh album.
    onCameraError: () => {
      if (isActive()) {
        setReady(false);
        setCameraError("Không mở được camera. Bạn có thể chọn ảnh từ album.");
      }
    },
    // Mục đích: Cho phép thử mở camera lại.
    // Cách chạy: Xóa lỗi camera và đợi sự kiện camera sẵn sàng mới.
    retryCamera: () => {
      setReady(false);
      setCameraError("");
    },
    // Mục đích: Thông báo ảnh đã chọn không đọc được.
    // Cách chạy: Đặt lỗi để giao diện yêu cầu chụp hoặc chọn lại.
    onImageError: () =>
      setError("Không đọc được ảnh. Vui lòng chụp hoặc chọn lại."),
  };
}
