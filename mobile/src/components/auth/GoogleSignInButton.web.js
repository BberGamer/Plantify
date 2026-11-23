import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { useFocusEffect } from "expo-router";
import authService from "../../services/authService";
import loadGoogleIdentity from "../../services/googleIdentity.web";
import getErrorMessage from "../../utils/getErrorMessage";

export default function GoogleSignInButton({ onCredential, disabled }) {
  const container = useRef(null);
  const callback = useRef(onCredential);
  const blocked = useRef(disabled);
  callback.current = onCredential;
  blocked.current = disabled;
  const [generation, setGeneration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useFocusEffect(useCallback(() => {
    let active = true;
    let refresh;
    let google;
    let pending = false;
    setLoading(true);
    setError("");
    async function initialize() {
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!clientId) throw Object.assign(new Error("Missing client id"), { code: "GOOGLE_NOT_CONFIGURED" });
      const [sdk, response] = await Promise.all([loadGoogleIdentity(), authService.googleChallenge()]);
      if (!active) return;
      const challenge = response?.data;
      if (response?.success !== true || typeof challenge?.nonce !== "string" ||
          typeof challenge.challengeToken !== "string" || !Number.isFinite(challenge.expiresAt))
        throw Object.assign(new Error("Invalid Google challenge"), { code: "INVALID_RESPONSE" });
      google = sdk;
      google.initialize({ client_id: clientId, nonce: challenge.nonce, ux_mode: "popup", auto_select: false,
        callback: async (result) => {
          if (!active || pending || blocked.current) return;
          pending = true;
          clearTimeout(refresh);
          try {
            if (typeof result?.credential !== "string") throw Object.assign(new Error("Missing Google token"), { code: "GOOGLE_TOKEN_INVALID" });
            await callback.current(result.credential, challenge.challengeToken);
          } catch (failure) { if (active) setError(getErrorMessage(failure)); }
          finally { if (active) setGeneration((value) => value + 1); }
        },
      });
      container.current?.replaceChildren();
      google.renderButton(container.current, { theme: "outline", size: "large", text: "continue_with", locale: "vi",
        width: Math.max(200, Math.min(400, container.current?.clientWidth || 300)), shape: "rectangular" });
      setLoading(false);
      refresh = setTimeout(() => { if (active) setGeneration((value) => value + 1); }, Math.max(1000, challenge.expiresAt - Date.now() - 5000));
    }
    initialize().catch((failure) => {
      if (active) { setLoading(false); setError(getErrorMessage(failure)); }
    });
    return () => {
      active = false;
      clearTimeout(refresh);
      google?.cancel();
      container.current?.replaceChildren();
    };
  }, [generation]));

  return <View style={{ minHeight: 48, alignItems: "center" }}>
    {loading && <ActivityIndicator accessibilityLabel="Đang tải đăng nhập Google" />}
    {!!error && <View><Text accessibilityRole="alert">{error}</Text><Button disabled={disabled} onPress={() => setGeneration((value) => value + 1)}>Tải lại Google</Button></View>}
    <View ref={container} pointerEvents={disabled ? "none" : "auto"} style={{ width: "100%", alignItems: "center", opacity: disabled ? 0.5 : 1 }} />
  </View>;
}
