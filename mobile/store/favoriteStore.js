import { create } from "zustand";
import useAuthStore from "./authStore";
import favoriteService from "../src/services/favoriteService";
import { getSessionContext, isSessionCurrent, sessionError } from "../src/services/sessionAccess";

const useFavoriteStore = create((set, get) => {
  let sequence = 0;
  const latest = new Map();
  const context = () => {
    const origin = getSessionContext();
    if (!origin.token || !origin.userId) throw sessionError("AUTH_REQUIRED");
    return origin;
  };
  return {
    favorites: {},
    pending: {},
    revision: 0,
    reset: () => {
      latest.clear();
      ++sequence;
      set({ favorites: {}, pending: {}, revision: 0 });
    },
    loadStatus: async (ids) => {
      const origin = context();
      const requested = [...new Set(ids)].filter((id) => !get().pending[id]);
      if (!requested.length) return;
      const request = ++sequence;
      requested.forEach((id) => latest.set(id, request));
      const favoriteIds = new Set(await favoriteService.getStatus(requested, origin));
      if (!isSessionCurrent(origin)) return;
      const values = { ...get().favorites };
      for (const id of requested) {
        if (latest.get(id) === request && !get().pending[id]) values[id] = favoriteIds.has(id);
      }
      set({ favorites: values });
    },
    loadPlants: async (params) => {
      const origin = context();
      const request = ++sequence;
      const response = await favoriteService.getPlants(params, origin);
      if (!isSessionCurrent(origin)) throw sessionError("SESSION_CHANGED");
      const values = { ...get().favorites };
      for (const plant of response.data.items) {
        if ((latest.get(plant._id) || 0) <= request && !get().pending[plant._id]) {
          latest.set(plant._id, request);
          values[plant._id] = true;
        }
      }
      set({ favorites: values });
      return response;
    },
    setFavorite: async (id, value) => {
      const origin = context();
      if (get().pending[id]) return;
      latest.set(id, ++sequence);
      set({ pending: { ...get().pending, [id]: true } });
      try {
        await favoriteService.setFavorite(id, value, origin);
        if (!isSessionCurrent(origin)) return;
        set({ favorites: { ...get().favorites, [id]: value }, revision: get().revision + 1 });
      } finally {
        if (isSessionCurrent(origin)) {
          // GET khởi chạy trước khi mutation kết thúc không được ghi đè kết quả vừa lưu.
          latest.set(id, ++sequence);
          const pending = { ...get().pending };
          delete pending[id];
          set({ pending });
        }
      }
    },
  };
});

// Cache chỉ ở bộ nhớ; nguồn dữ liệu bền vững là backend của phiên đang đăng nhập.
useAuthStore.subscribe((state, previous) => {
  if (state.sessionVersion !== previous.sessionVersion || state.token !== previous.token ||
      (state.user?._id || state.user?.id) !== (previous.user?._id || previous.user?.id) ||
      state.user?.role !== previous.user?.role) useFavoriteStore.getState().reset();
});

export default useFavoriteStore;
