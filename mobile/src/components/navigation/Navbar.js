import { spacing } from "../../theme/tokens";
import { colors } from "../../theme/colors";

import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const ACTIVE_COLOR = "#54BE8B";
const INACTIVE_COLOR = "#8F9F99";

const ITEMS = [
  {
    label: "Trang chủ",
    icon: "home-outline",
    activeIcon: "home",
    path: "/customer",
    href: "/customer",
  },
  {
    label: "Danh sách\ncây",
    icon: "list-outline",
    activeIcon: "list",
    path: "/plants",
    href: "/plants",
  },
  { label: "Chẩn đoán", icon: "camera", camera: true },
  {
    label: "Vườn\ncây",
    icon: "leaf-outline",
    activeIcon: "leaf",
    path: "/customer/garden",
    href: "/customer/garden",
  },
  {
    label: "Tài khoản",
    icon: "person-outline",
    activeIcon: "person",
    path: "/customer/profile",
    href: "/customer/profile",
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.navbar, { paddingBottom: insets.bottom }]}>
      {ITEMS.map((item) => {
        // Dựa vào trang thực tế, không cố định Home đang active như bản cũ.
        const isActive = pathname === item.path;
        const canNavigate = Boolean(item.href);
        return (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            disabled={!canNavigate}
            accessibilityRole="button"
            accessibilityLabel={item.label.replace("\n", " ")}
            accessibilityHint={item.camera ? "Chưa khả dụng" : undefined}
            accessibilityState={{ selected: isActive, disabled: !canNavigate }}
            // navigate tái sử dụng trang trong stack khi có thể, tránh push lặp trang.
            onPress={() => {
              if (canNavigate && !isActive) router.navigate(item.href);
            }}
          >
            <View style={styles.iconSlot}>
              {item.camera ? (
                <LinearGradient
                  colors={["#B5E77B", "#21C978"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.camera}
                >
                  <Ionicons name="camera" size={24} color={colors.white} />
                </LinearGradient>
              ) : (
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={20}
                  color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.white,
    zIndex: 1,
    overflow: "visible",
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 8,
    paddingBottom: 8,
    position: "relative",
  },
  pressed: { backgroundColor: colors.softMintBg },
  iconSlot: {
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  camera: {
    position: "absolute",
    top: -22,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: spacing.xs,
    color: INACTIVE_COLOR,
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  activeLabel: { color: ACTIVE_COLOR, fontWeight: "600" },
});
