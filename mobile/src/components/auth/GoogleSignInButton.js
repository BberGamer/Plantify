import { componentStyles } from "../../theme/componentStyles";
import { useRef, useState } from "react";
import { Button, Text } from "react-native-paper";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import authService from "../../services/authService";
import getErrorMessage from "../../utils/getErrorMessage";
import useScreenScope from "../../hooks/useScreenScope";

export default function GoogleSignInButton({ onCredential, disabled }) {
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { capture, isActive } = useScreenScope();

  const signIn = async () => {
    if (pending.current || disabled || !isActive()) return;
    const inScreen = capture();
    pending.current = true;
    setLoading(true);
    setError("");
    try {
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!webClientId) {
        throw Object.assign(new Error("Google client ID is missing"), {
          code: "GOOGLE_NOT_CONFIGURED",
        });
      }
      // Mỗi lần chọn tài khoản dùng một nonce mới do backend cấp.
      const result = await authService.googleChallenge();
      if (!inScreen()) return;
      const challenge = result?.data;
      if (
        result?.success !== true ||
        typeof challenge?.nonce !== "string" ||
        typeof challenge?.challengeToken !== "string" ||
        !Number.isFinite(challenge?.expiresAt) ||
        challenge.expiresAt <= Date.now()
      ) {
        throw Object.assign(new Error("Invalid Google challenge"), {
          code: "INVALID_RESPONSE",
        });
      }
      GoogleOneTapSignIn.configure({ webClientId, nonce: challenge.nonce });
      await GoogleOneTapSignIn.checkPlayServices();
      if (!inScreen()) return;
      // Nút bấm chủ động mở hộp chọn tài khoản, không thử phiên One Tap cũ trước.
      const response = await GoogleOneTapSignIn.presentExplicitSignIn();
      if (!inScreen()) return;
      if (isCancelledResponse(response)) return;
      if (
        !isSuccessResponse(response) ||
        typeof response.data?.idToken !== "string"
      ) {
        throw Object.assign(new Error("Google did not return an ID token"), {
          code: "GOOGLE_TOKEN_INVALID",
        });
      }
      await onCredential(response.data.idToken, challenge.challengeToken);
    } catch (failure) {
      if (!inScreen()) return;
      const nativeCode =
        typeof failure?.code === "string"
          ? failure.code
          : /ONE_TAP_START_FAILED|DEVELOPER_ERROR|SIGN_IN_REQUIRED|PLAY_SERVICES_NOT_AVAILABLE/.exec(
              String(failure?.message || ""),
            )?.[0];
      const message = getErrorMessage(
        failure,
        "Đăng nhập Google thất bại. Vui lòng thử lại.",
      );
      // Chỉ hiện chẩn đoán provider ở bản development; không in token hoặc đối tượng lỗi.
      const detail =
        __DEV__ && nativeCode && typeof failure?.message === "string"
          ? failure.message
              .split("\n")[0]
              .replace(/[\w.+-]+@[\w.-]+/g, "[email]")
              .replace(/eyJ[\w-]+(?:\.[\w-]+)+/g, "[token]")
              .slice(0, 400)
          : "";
      setError(
        __DEV__ && nativeCode
          ? `${message} (Mã Google: ${nativeCode})${detail ? `\nChi tiết: ${detail}` : ""}`
          : message,
      );
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };

  return (
    <>
      {!!error && <Text accessibilityRole="alert">{error}</Text>}
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
        mode="outlined"
        icon="google"
        onPress={signIn}
        disabled={disabled || loading}
        loading={loading}
      >
        Tiếp tục với Google
      </Button>
    </>
  );
}
