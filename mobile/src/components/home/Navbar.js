import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { usePathname, useRouter } from "expo-router";

const ITEMS = [
  {
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
    path: "/",
    href: "/(tabs)",
  },
  { label: "Diagnose", icon: "camera-outline" },
  { label: "My\nGarden", icon: "leaf-outline" },
  { label: "AI Chat", icon: "chatbubble-outline" },
  {
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
    path: "/profile",
    href: "/(tabs)/profile",
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <View style={styles.navbar}>
      {ITEMS.map((item) => {
        // Dựa vào trang thực tế, không cố định Home đang active như bản cũ.
        const isActive = pathname === item.path;
        const canNavigate = Boolean(item.href);
        return (
          <Pressable
            key={item.label}
            style={styles.item}
            disabled={!canNavigate}
            accessibilityRole="button"
            accessibilityLabel={item.label.replace("\n", " ")}
            accessibilityState={{ selected: isActive, disabled: !canNavigate }}
            // navigate tái sử dụng trang trong stack khi có thể, tránh push lặp trang.
            onPress={() => {
              if (canNavigate && !isActive) router.navigate(item.href);
            }}
          >
            {isActive && <View style={styles.activeIndicator} />}
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={21}
              color={isActive ? "#183B2B" : "#9AA3A5"}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8ECEA",
    shadowColor: "#183B2B",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 10,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -1,
    width: 28,
    height: 2,
    backgroundColor: "#183B2B",
  },
  label: {
    marginTop: 4,
    color: "#9AA3A5",
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
  },
  activeLabel: { color: "#183B2B", fontWeight: "600" },
  activeDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#183B2B",
  },
});
