import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { garden, getRoleMeta } from "./theme";

export function RoleBadge({ role }) {
  const meta = getRoleMeta(role);

  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Ionicons name={meta.icon} size={12} color={meta.color} />
      <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

export function StatusBadge({ status }) {
  const isActive = status !== false;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isActive ? garden.mint : garden.terracottaBg },
      ]}
    >
      <Ionicons
        name={isActive ? "water" : "snow"}
        size={12}
        color={isActive ? garden.sprout : garden.terracotta}
      />
      <Text
        style={[
          styles.badgeText,
          { color: isActive ? garden.moss : garden.terracotta },
        ]}
      >
        {isActive ? "Hoạt động" : "Bị khóa"}
      </Text>
    </View>
  );
}

export function GoogleBadge() {
  return (
    <View style={[styles.badge, { backgroundColor: garden.barkBg }]}>
      <Ionicons name="logo-google" size={11} color={garden.bark} />
      <Text style={[styles.badgeText, { color: garden.bark }]}>Google</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
