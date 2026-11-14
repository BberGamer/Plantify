import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RoleBadge, StatusBadge, GoogleBadge } from "./UserBadges";
import { garden } from "./theme";

export default function UserCard({
  item,
  currentAdminId,
  onOpenDetail,
}) {
  const initials = item.fullName
    ? item.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "PL";

  const isSelf = item._id === currentAdminId;
  const isActive = item.status !== false;


  return (
    <View style={[styles.userCard, !isActive && styles.userCardDormant]}>
      {/* CARD HEADER / SUMMARY */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onOpenDetail(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Xem chi tiết ${item.fullName}`}
      >
        {/* Avatar hinh chiec la */}
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isActive ? garden.moss : garden.muted },
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.fullName}
            </Text>
            {isSelf && (
              <View style={styles.selfTag}>
                <Text style={styles.selfTagText}>Bạn</Text>
              </View>
            )}
          </View>

          <View style={styles.metaLine}>
            <Ionicons name="mail-outline" size={13} color={garden.muted} />
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>

          {item.phone ? (
            <View style={styles.metaLine}>
              <Ionicons name="call-outline" size={13} color={garden.muted} />
              <Text style={styles.userPhone}>{item.phone}</Text>
            </View>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={18} color={garden.muted} />
      </TouchableOpacity>

      {/* TAGS ROW */}
      <View style={styles.tagsRow}>
        <RoleBadge role={item.role} />
        <StatusBadge status={item.status} />
        {item.isGoogleAccount && <GoogleBadge />}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: garden.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: garden.line,
    overflow: "hidden",
  },
  userCardDormant: {
    backgroundColor: "#FBFBF8",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    width: 50,
    height: 50,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: garden.white,
    fontWeight: "800",
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "700",
    color: garden.ink,
  },
  selfTag: {
    marginLeft: 6,
    backgroundColor: garden.sunBg,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 8,
  },
  selfTagText: {
    fontSize: 11,
    color: garden.sun,
    fontWeight: "700",
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 5,
  },
  userEmail: {
    flex: 1,
    fontSize: 13,
    color: garden.inkSoft,
  },
  userPhone: {
    fontSize: 13,
    color: garden.inkSoft,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 6,
  },
});
