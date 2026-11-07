import { useEffect, useRef } from "react";
import useAuthStore from "../../store/authStore";
import useFavoriteStore from "../../store/favoriteStore";
import usePaginatedList from "./usePaginatedList";
import useFavoriteActions from "./useFavoriteActions";

export default function useFavoritePlants() {
  const enabled = useAuthStore((state) => state.isAuthenticated && state.user?.role === "customer");
  const fetchPage = useFavoriteStore((state) => state.loadPlants);
  const revision = useFavoriteStore((state) => state.revision);
  const list = usePaginatedList(fetchPage, { limit: 20, enabled });
  const actions = useFavoriteActions(list.items, false);
  const previousRevision = useRef(revision);
  useEffect(() => {
    if (previousRevision.current !== revision) {
      previousRevision.current = revision;
      list.refresh();
    }
  }, [revision, list.refresh]);
  const plants = enabled ? list.items.filter((plant) => actions.favorites[plant._id] !== false) : [];
  return { ...list, plants, actions, enabled,
    refresh: () => { actions.clearError(); return list.refresh(); },
  };
}
