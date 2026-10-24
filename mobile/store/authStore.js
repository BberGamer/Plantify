import { create } from "zustand";
import authService from "../src/services/authService";
import getErrorMessage from "../src/utils/getErrorMessage";
import sessionStorage, { normalizeSession, normalizeSessionUser } from "../src/services/sessionStorage";
import { bindSessionAccess, sessionError } from "../src/services/sessionAccess";

const emptySession = { user: null, token: null, isAuthenticated: false };
const cancelled = () => ({ success: false, cancelled: true });

export const useAuthStore = create((set, get) => {
  let hydration = null;
  let authentication = null;
  let profileMutation = null;
  const context = () => ({
    version: get().sessionVersion,
    token: get().token,
    userId: get().user?._id || get().user?.id || null,
  });
  const matches = (expected) => {
    const current = context();
    return !!expected && expected.version === current.version &&
      expected.token === current.token && expected.userId === current.userId;
  };
  const reset = (extra = {}) => {
    authentication = null;
    profileMutation = null;
    set({ ...emptySession, sessionVersion: get().sessionVersion + 1,
      hasHydrated: true, isRestoring: false, isLoggingIn: false, ...extra });
    return context();
  };

  const establish = async (fetchSession, expected, loggingIn, canCommit = () => true) => {
    if (expected && !matches(expected)) return cancelled();
    if (authentication) return { success: false, error: getErrorMessage(sessionError("REQUEST_IN_PROGRESS")) };
    const attempt = { context: reset({ isLoggingIn: loggingIn }) };
    authentication = attempt;
    const cleanup = sessionStorage.clear();
    try {
      const response = await fetchSession();
      if (!matches(attempt.context) || !canCommit()) return cancelled();
      if (response?.success === false) throw Object.assign(new Error("Đăng nhập thất bại."), { response: { data: response } });
      if (response?.success !== true) throw sessionError("INVALID_RESPONSE");
      const session = normalizeSession(response.data);
      const saved = await sessionStorage.write(session, () => matches(attempt.context) && canCommit());
      if (!saved || !matches(attempt.context) || !canCommit()) return cancelled();
      set({ ...session, isAuthenticated: true, isLoggingIn: false });
      return { success: true, user: session.user };
    } catch (error) {
      await cleanup;
      if (!matches(attempt.context)) return cancelled();
      set({ ...emptySession, isLoggingIn: false });
      return { success: false, error: getErrorMessage(error, "Đăng nhập thất bại. Vui lòng thử lại.") };
    } finally {
      if (authentication === attempt) authentication = null;
      if (matches(attempt.context) && !get().isAuthenticated) set({ isLoggingIn: false });
    }
  };

  return {
    ...emptySession,
    sessionVersion: 0,
    hasHydrated: false,
    isRestoring: true,
    isLoggingIn: false,

    loadUser: () => {
      if (get().hasHydrated) return Promise.resolve();
      if (hydration) return hydration;
      const origin = context();
      set({ isRestoring: true });
      hydration = (async () => {
        try {
          const session = await sessionStorage.read(() => matches(origin));
          if (!matches(origin)) return;
          set({ ...(session || emptySession), isAuthenticated: !!session,
            sessionVersion: get().sessionVersion + (session || get().token || get().user ? 1 : 0),
            hasHydrated: true, isRestoring: false, isLoggingIn: false });
        } catch {
          if (!matches(origin)) return;
          set({ ...emptySession, sessionVersion: get().sessionVersion + 1,
            hasHydrated: true, isRestoring: false, isLoggingIn: false });
          // Queue trước mọi lần đăng nhập kế tiếp; không chạy cleanup trễ sau login mới.
          await sessionStorage.clear();
        } finally { hydration = null; }
      })();
      return hydration;
    },

    login: (email, password, canCommit) => establish(() => authService.login({ email, password }), null, true, canCommit),

    setAuthSession: (user, token, expected, canCommit) => {
      if (get().isAuthenticated) return Promise.resolve(cancelled());
      return establish(() => ({ success: true, data: { user, token } }), expected, false, canCommit);
    },

    updateProfile: async (data, expected) => {
      if (expected && !matches(expected)) return { cancelled: true };
      const origin = context();
      if (!origin.token || !origin.userId) throw sessionError("AUTH_REQUIRED");
      if (profileMutation) throw sessionError("REQUEST_IN_PROGRESS");
      const attempt = {};
      profileMutation = attempt;
      try {
        const response = await authService.updateProfile({ ...data }, origin);
        if (!matches(origin)) return { cancelled: true };
        if (response?.success === false) throw Object.assign(new Error("Không thể lưu hồ sơ."), { response: { data: response } });
        if (response?.success !== true) throw sessionError("INVALID_RESPONSE");
        const user = normalizeSessionUser(response.data);
        if ((user._id || user.id) !== origin.userId) throw sessionError("INVALID_RESPONSE");
        set({ user });
        try {
          const cacheSaved = await sessionStorage.write({ user, token: origin.token }, () => matches(origin));
          return matches(origin) ? { cacheSaved } : { cancelled: true };
        } catch {
          return matches(origin) ? { cacheSaved: false } : { cancelled: true };
        }
      } catch (error) {
        if (!matches(origin)) return { cancelled: true };
        throw error;
      } finally {
        if (profileMutation === attempt) profileMutation = null;
      }
    },

    logout: async () => {
      const origin = context();
      const signedOut = reset(); // Xóa trong bộ nhớ ngay, trước mọi await hoặc lỗi storage/server.
      const cleanup = sessionStorage.clear();
      const remote = origin.token
        ? Promise.resolve().then(() => authService.logout(origin)).catch(() => {})
        : Promise.resolve();
      const [cacheCleared] = await Promise.all([cleanup, remote]);
      return { success: true, cacheCleared, context: signedOut };
    },

    expireSession: (origin) => {
      if (!origin?.token || !matches(origin)) return false;
      reset();
      void sessionStorage.clear();
      return true;
    },
  };
});

bindSessionAccess({
  getContext: () => {
    const state = useAuthStore.getState();
    return { version: state.sessionVersion, token: state.token,
      userId: state.user?._id || state.user?.id || null };
  },
  expire: (origin) => useAuthStore.getState().expireSession(origin),
});

export default useAuthStore;
