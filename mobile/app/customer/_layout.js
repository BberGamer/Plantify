import { Stack } from "expo-router";
import useAuthStore from "../../store/authStore";
import { colors } from "../../src/theme/colors";

export default function CustomerLayout() {
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore(
    (state) => state.hasHydrated && !state.isRestoring && state.isAuthenticated,
  );
  if (!ready || user?.role !== "customer") return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
