import { colors } from "../../src/theme";
// app/admin/_layout.js - Khu vuc rieng cua Admin

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../store/authStore";

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore(
    (state) => state.hasHydrated && !state.isRestoring && state.isAuthenticated,
  );
  if (!ready || user?.role !== "admin") return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(8, insets.bottom),
          borderTopColor: colors.border,
          backgroundColor: "#FFFFFF",
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="users"
        options={{
          title: "Người dùng",
          tabBarLabel: "Người dùng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Tài chính",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarLabel: "Hồ sơ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
