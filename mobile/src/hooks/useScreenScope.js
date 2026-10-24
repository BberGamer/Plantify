import { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";
import useAuthStore from "../../store/authStore";

// Blur cũng kết thúc ngữ cảnh, kể cả khi navigator giữ màn hình mounted.
// Auth establish/logout tự đổi phiên: các caller đó dùng trackSession=false,
// capture(false), rồi để store xác minh thế hệ phiên của chính thao tác.
export default function useScreenScope(onFocus, onBlur, contextKey, trackSession = true) {
  const sessionVersion = useAuthStore((state) =>
    trackSession ? state.sessionVersion : null,
  );
  const state = useRef({ active: false, generation: 0 });
  const callbacks = useRef({ onFocus, onBlur });
  callbacks.current = { onFocus, onBlur };
  useFocusEffect(
    useCallback(() => {
      state.current.active = true;
      ++state.current.generation;
      callbacks.current.onFocus?.();
      return () => {
        state.current.active = false;
        ++state.current.generation;
        callbacks.current.onBlur?.();
      };
    }, [contextKey, sessionVersion]),
  );
  const capture = useCallback((checkSession = true) => {
    const generation = state.current.generation;
    const session = getSessionContext();
    return () =>
      state.current.active &&
      generation === state.current.generation &&
      (!checkSession || isSessionCurrent(session));
  }, []);
  const isActive = useCallback(() => state.current.active, []);
  return { capture, isActive };
}
