import { useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import useFavoriteStore from "../../store/favoriteStore";
import useScreenScope from "./useScreenScope";
import getErrorMessage from "../utils/getErrorMessage";

export default function useFavoriteActions(plants, fetchStatus = true) {
  const enabled = useAuthStore((state) => state.isAuthenticated && state.user?.role === "customer");
  const favorites = useFavoriteStore((state) => state.favorites);
  const pending = useFavoriteStore((state) => state.pending);
  const [error, setError] = useState("");
  const request = useRef(0);
  const idsKey = plants.map((plant) => plant._id).join(",");
  const { capture, isActive } = useScreenScope(() => {
    setError("");
    if (fetchStatus) load();
  }, undefined, `${enabled}:${fetchStatus}:${idsKey}`);

  async function load() {
    if (!enabled || !idsKey || !isActive()) return;
    const inScope = capture();
    const id = ++request.current;
    setError("");
    try { await useFavoriteStore.getState().loadStatus(idsKey.split(",")); }
    catch (failure) {
      if (inScope() && id === request.current) setError(getErrorMessage(failure, "Không thể tải trạng thái yêu thích."));
    }
  }

  async function toggle(id) {
    if (!enabled || !isActive()) return;
    const state = useFavoriteStore.getState();
    if (state.pending[id] || state.favorites[id] === undefined) return;
    const inScope = capture();
    setError("");
    try { await state.setFavorite(id, !state.favorites[id]); }
    catch (failure) {
      if (inScope()) setError(getErrorMessage(failure, "Không thể cập nhật yêu thích. Vui lòng thử lại."));
    }
  }
  return { enabled, favorites, pending, error, toggle, retry: load, clearError: () => setError("") };
}
