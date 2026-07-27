import { useCallback, useState } from "react";
import {
  forgotPasswordApi,
  resetPasswordApi,
  sendRegisterOtpApi,
  verifyOtpApi,
  verifyRegisterOtpApi,
} from "@/features/auth/api";
import { useAuth } from "@/features/auth/hooks/useAuth";

function useMutationMap() {
  const [pending, setPending] = useState({});
  const [errors, setErrors] = useState({});

  const execute = useCallback(async (key, request) => {
    setPending((current) => ({ ...current, [key]: true }));
    setErrors((current) => ({ ...current, [key]: null }));
    try {
      return await request();
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: error }));
      throw error;
    } finally {
      setPending((current) => ({ ...current, [key]: false }));
    }
  }, []);

  return { pending, errors, execute };
}

export function useRegistrationMutations() {
  const { pending, errors, execute } = useMutationMap();

  const sendRegistrationOtp = useCallback(
    (userData) => execute("send", () => sendRegisterOtpApi(userData)),
    [execute]
  );
  const verifyRegistrationOtp = useCallback(
    (email, otp) => execute("verify", () => verifyRegisterOtpApi(email, otp)),
    [execute]
  );
  const resendRegistrationOtp = useCallback(
    (userData) => execute("resend", () => sendRegisterOtpApi(userData)),
    [execute]
  );

  return {
    sendRegistrationOtp,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    sending: Boolean(pending.send),
    verifying: Boolean(pending.verify),
    resending: Boolean(pending.resend),
    error: errors.send || errors.verify || errors.resend || null,
  };
}

export function useLoginMutation() {
  const { login } = useAuth();
  const { pending, errors, execute } = useMutationMap();

  const loginUser = useCallback(
    (email, password) => execute("login", () => login(email, password)),
    [execute, login]
  );

  return {
    loginUser,
    loggingIn: Boolean(pending.login),
    error: errors.login || null,
  };
}

export function usePasswordResetMutations() {
  const { pending, errors, execute } = useMutationMap();

  const sendPasswordResetOtp = useCallback(
    (email) => execute("send", () => forgotPasswordApi(email)),
    [execute]
  );
  const resendPasswordResetOtp = useCallback(
    (email) => execute("resend", () => forgotPasswordApi(email)),
    [execute]
  );
  const verifyPasswordResetOtp = useCallback(
    (email, otp) => execute("verify", () => verifyOtpApi(email, otp)),
    [execute]
  );
  const resetPassword = useCallback(
    (email, otp, password, confirmPassword) => (
      execute(
        "reset",
        () => resetPasswordApi(email, otp, password, confirmPassword)
      )
    ),
    [execute]
  );

  return {
    sendPasswordResetOtp,
    resendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    sending: Boolean(pending.send),
    resending: Boolean(pending.resend),
    verifying: Boolean(pending.verify),
    resetting: Boolean(pending.reset),
    error: errors.send || errors.resend || errors.verify || errors.reset || null,
  };
}
