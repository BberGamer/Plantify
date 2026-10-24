// useOtpCountdown.js - Quản lý thời gian chờ gửi lại OTP và dọn timer.
import { useCallback, useEffect, useRef, useState } from "react";

export default function useOtpCountdown(active) {
  const [countdown, setCountdown] = useState(0);
  const deadline = useRef(0);

  useEffect(() => {
    if (!active || countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(
        Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [active, countdown]);

  const startCountdown = useCallback(() => {
    deadline.current = Date.now() + 60000;
    setCountdown(60);
  }, []);
  const resetCountdown = useCallback(() => {
    deadline.current = 0;
    setCountdown(0);
  }, []);

  return {
    countdown,
    startCountdown,
    resetCountdown,
    canResend: () => Date.now() >= deadline.current,
  };
}
