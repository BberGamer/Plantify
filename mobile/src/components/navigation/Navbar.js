import { spacing } from "../../theme/tokens";
import { colors } from "../../theme/colors";

import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE_COLOR = colors.primary;
const INACTIVE_COLOR = colors.textSecondary;

const ITEMS = [
  {
    label: "Trang chủ",
    icon: "home-outline",
    activeIcon: "home",
    path: "/customer/home",
    href: "/customer/home",
  },
  {
    label: "Danh mục",
    icon: "list-outline",
    activeIcon: "list",
    path: "/plants",
    href: "/plants",
  },
  {
    label: "Camera",
    icon: "camera",
    camera: true,
    path: "/customer/diagnosis",
    href: "/customer/diagnosis",
  },
  {
    label: "Vườn cây",
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
        const isActive =
          pathname === item.path ||
          (item.camera && pathname === "/customer/identification") ||
          (item.path === "/customer/profile" &&
            ["/customer/favorites", "/customer/diagnosis-history"].includes(
              pathname,
            ));
        const canNavigate = Boolean(item.href);
        return (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.item,
              item.camera && styles.cameraItem,
              pressed && styles.pressed,
            ]}
            disabled={!canNavigate}
            accessibilityRole="button"
            accessibilityLabel={item.label.replace("\n", " ")}
            accessibilityHint={
              item.camera
                ? "Mở camera nhận diện cây và chẩn đoán bệnh"
                : undefined
            }
            accessibilityState={{ selected: isActive, disabled: !canNavigate }}
            // navigate tái sử dụng trang trong stack khi có thể, tránh push lặp trang.
            onPress={() => {
              if (canNavigate && !isActive) router.navigate(item.href);
            }}
          >
            <View style={[styles.iconSlot, item.camera && styles.cameraSlot]}>
              {item.camera ? (
                <View
                  style={styles.camera}
                >
                  <Ionicons name="camera" size={24} color={colors.white} />
                </View>
              ) : (
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={20}
                  color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
                item.camera && styles.cameraLabel,
              ]}
            >
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 1,
    overflow: "visible",
    paddingTop: 4
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 8,
    paddingBottom: 8,
    position: "relative"
  },
  pressed: {
    backgroundColor: colors.softMintBg
  },
  cameraItem: {},
  cameraSlot: {
    height: 26
  },
  cameraLabel: {
    color: colors.primaryLight,
    fontWeight: "700"
  },
  iconSlot: {
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  camera: {
    width: 44,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    marginTop: spacing.xs,
    color: INACTIVE_COLOR,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 2
  },
  activeLabel: {
    color: ACTIVE_COLOR,
    fontWeight: "600"
  }
});
