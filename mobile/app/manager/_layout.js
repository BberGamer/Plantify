import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import useAuthStore from "../../store/authStore";

export default function ManagerLayout() {
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore(
    (state) => state.hasHydrated && !state.isRestoring && state.isAuthenticated,
  );
  if (!ready || user?.role !== "manager") return null;

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
        name="plants"
        options={{
          title: "Cây trồng",
          tabBarLabel: "Cây trồng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="diseases"
        options={{
          title: "Bệnh cây",
          tabBarLabel: "Bệnh cây",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="treatments"
        options={{
          title: "Điều trị",
          tabBarLabel: "Điều trị",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" color={color} size={size} />
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
