import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RoleBadge, StatusBadge, GoogleBadge } from "./UserBadges";
import { garden, getRoleMeta, leafShape } from "./theme";

export default function UserCard({
  item,
  currentAdminId,
  onOpenDetail,
  onOpenRole,
  onOpenStatus,
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
  const roleMeta = getRoleMeta(item.role);

  return (
    <View style={[styles.userCard, !isActive && styles.userCardDormant]}>
      {/* Vien la ben trai the hien vai tro */}
      <View style={[styles.stem, { backgroundColor: roleMeta.color }]} />

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
          <View style={[styles.avatarSprout, { backgroundColor: roleMeta.bg }]}>
            <Ionicons name={roleMeta.icon} size={11} color={roleMeta.color} />
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

      {/* ACTION BUTTONS ROW */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnSoft]}
          onPress={() => onOpenDetail(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons name="create-outline" size={15} color={garden.forest} />
          <Text style={styles.btnSoftText}>Chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnSoft]}
          onPress={() => onOpenRole(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons name="git-branch-outline" size={15} color={garden.forest} />
          <Text style={styles.btnSoftText}>Vai trò</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            isActive ? styles.btnDanger : styles.btnSuccess,
          ]}
          onPress={() => onOpenStatus(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons
            name={isActive ? "lock-closed" : "leaf"}
            size={14}
            color={isActive ? garden.terracotta : garden.white}
          />
          <Text
            style={[
              styles.btnSolidText,
              { color: isActive ? garden.terracotta : garden.white },
            ]}
          >
            {isActive ? "Khóa" : "Kích hoạt"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: garden.white,
    borderRadius: 20,
    borderTopLeftRadius: 28,
    padding: 14,
    paddingLeft: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: garden.line,
    overflow: "hidden",
    shadowColor: garden.forest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  userCardDormant: {
    backgroundColor: "#FBFBF8",
  },
  stem: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
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
    ...leafShape(46),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: garden.white,
    fontWeight: "800",
    fontSize: 16,
  },
  avatarSprout: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: garden.white,
    justifyContent: "center",
    alignItems: "center",
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
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: garden.line,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 14,
    gap: 5,
  },
  btnSoft: {
    backgroundColor: garden.mint,
  },
  btnSoftText: {
    fontSize: 13,
    fontWeight: "600",
    color: garden.forest,
  },
  btnDanger: {
    backgroundColor: garden.terracottaBg,
  },
  btnSuccess: {
    backgroundColor: garden.moss,
  },
  btnSolidText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
