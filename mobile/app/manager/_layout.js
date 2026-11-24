import { colors } from "../../src/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../store/authStore";

export default function ManagerLayout() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore(
    (state) => state.hasHydrated && !state.isRestoring && state.isAuthenticated,
  );
  if (!ready || user?.role !== "manager") return null;

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
        name="protocol-generator"
        options={{
          title: "Tạo phác đồ",
          tabBarLabel: "Phác đồ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="feedback" options={{ title: "Quản lý đóng góp", tabBarLabel: "Góp ý",
        tabBarIcon: ({ color, size }) => <Ionicons name="chatbox-ellipses-outline" color={color} size={size} />,
      }} />
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
