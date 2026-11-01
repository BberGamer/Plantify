import { useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import useAuthStore from "../../store/authStore";
import useScreenScope from "./useScreenScope";

export default function useDiagnosisCapture() {
  const [permission, requestPermission, refreshPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  const [cameraError, setCameraError] = useState("");
  const [error, setError] = useState("");
  const camera = useRef(null);
  const pending = useRef(null);
  const version = useAuthStore((state) => state.sessionVersion);
  const { capture, isActive } = useScreenScope(
    () => setFocused(true),
    () => {
      pending.current = null;
      setFocused(false);
      setBusy(false);
      setReady(false);
    },
  );

  useEffect(() => {
    setPhoto(null);
    setError("");
    setCameraError("");
  }, [version]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      setReady(false);
      if (state === "active" && isActive() && Platform.OS !== "web") {
        void refreshPermission().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [isActive, refreshPermission]);

  // Chỉ thao tác còn thuộc màn hình/phiên hiện tại được cập nhật ảnh và trạng thái.
  const run = async (operation) => {
    if (pending.current || !isActive()) return;
    const attempt = {};
    pending.current = attempt;
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
        if (current()) setBusy(false);
      }
    }
  };

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
      source,
    });
  };

  const pickPhoto = () => run(async (current) => {
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

  const takePhoto = () => {
    if (!ready || !foreground || !camera.current) return;
    return run(async (current) => {
      const asset = await camera.current.takePictureAsync({ quality: 0.9, exif: false });
      acceptPhoto(asset, "camera", current);
    });
  };

  const enableCamera = () => run(async (current) => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      await Linking.openSettings();
    } else {
      await requestPermission();
      if (current()) setCameraError("");
    }
  });

  const retake = () => {
    if (pending.current || !isActive()) return;
    setPhoto(null);
    setReady(false);
    setError("");
    setCameraError("");
  };

  return {
    camera, photo, busy, error, cameraError, permission,
    showCamera: Platform.OS !== "web" && focused && foreground &&
      permission?.granted === true && !photo && !cameraError,
    canCapture: ready && foreground && !busy,
    takePhoto, pickPhoto, enableCamera, retake,
    onCameraReady: () => { if (isActive()) setReady(true); },
    onCameraError: () => {
      if (isActive()) {
        setReady(false);
        setCameraError("Không mở được camera. Bạn có thể chọn ảnh từ album.");
      }
    },
    retryCamera: () => { setReady(false); setCameraError(""); },
    onImageError: () => setError("Không đọc được ảnh. Vui lòng chụp hoặc chọn lại."),
  };
}
