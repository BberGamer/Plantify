// app/admin/_layout.js - Khu vuc rieng cua Admin

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore(
    (state) => state.hasHydrated && !state.isRestoring && state.isAuthenticated,
  );
  if (!ready || user?.role !== "admin") return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#144D37",
        tabBarInactiveTintColor: "#8A938D",
        tabBarStyle: {
          height: 64,
          paddingTop: 7,
          paddingBottom: 7,
          borderTopColor: "#E8ECE9",
          backgroundColor: "#FFFFFF",
        },
        contentStyle: { backgroundColor: "#F9FAF9" },
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
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
