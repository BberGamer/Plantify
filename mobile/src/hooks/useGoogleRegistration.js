import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";
import { getSessionContext } from "../services/sessionAccess";
import useScreenScope from "./useScreenScope";
import validateRegistration from "../utils/registrationValidation";
import getErrorMessage from "../utils/getErrorMessage";

export default function useGoogleRegistration() {
  const router = useRouter();
  const registration = useAuthStore((state) => state.googleRegistration);
  const loading = useAuthStore((state) => state.isLoggingIn);
  const [form, setForm] = useState(() => ({ fullName: registration?.profile.fullName || "",
    email: registration?.profile.email || "", phone: "", password: "", confirmPassword: "", agreeTerms: false }));
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(!registration || registration.expiresAt <= Date.now());
  const pending = useRef(false);
  const { capture, isActive } = useScreenScope(undefined, undefined, undefined, false);
  useEffect(() => {
    if (!registration) { setExpired(true); return; }
    const timer = setTimeout(() => setExpired(true), Math.max(0, registration.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [registration]);

  const submit = async () => {
    if (pending.current || loading || !isActive()) return;
    if (expired || !registration) { setError(getErrorMessage({ code: "GOOGLE_FLOW_EXPIRED" })); return; }
    const invalid = validateRegistration(form);
    if (invalid) { setError(invalid); return; }
    const current = capture(false);
    pending.current = true;
    setError("");
    try {
      const result = await useAuthStore.getState().completeGoogle({ fullName: form.fullName.trim(), phone: form.phone.trim(),
        password: form.password, confirmPassword: form.confirmPassword, agreeTerms: form.agreeTerms }, getSessionContext(), current);
      if (!current()) return;
      if (result.success) setForm((value) => ({ ...value, password: "", confirmPassword: "" }));
      else if (!result.cancelled) setError(result.error);
    } catch (failure) { if (current()) setError(getErrorMessage(failure)); }
    finally { pending.current = false; }
  };
  const cancel = () => {
    if (pending.current || loading) return;
    useAuthStore.getState().clearGoogleRegistration();
    setForm((value) => ({ ...value, password: "", confirmPassword: "" }));
    router.replace("/auth/login");
  };
  return { form, loading, error, expired, submit, cancel,
    change: (key, value) => {
      if (pending.current || loading || key === "email" || !Object.prototype.hasOwnProperty.call(form, key)) return;
      setForm((previous) => ({ ...previous, [key]: value }));
      setError("");
    },
  };
}
