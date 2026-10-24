import { useEffect } from "react";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import useAuthStore from "../../store/authStore";
import { getAuthRedirect } from "../constants/authRoutes";

// Root guard sở hữu redirect phiên; layout con chỉ chặn render khi chưa đủ quyền.
export default function useAuthNavigation() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const group = useSegments()[0];
  const navigationKey = useRootNavigationState()?.key;
  const router = useRouter();
  const destination = getAuthRedirect({ hasHydrated, isRestoring, isAuthenticated, role }, group);
  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => {
    if (navigationKey && destination) router.replace(destination);
  }, [navigationKey, destination, router]);
}
