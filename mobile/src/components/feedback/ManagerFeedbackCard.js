import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";
import { feedbackTime, statusLabels, typeLabels } from "./feedbackLabels";

import { FeedbackStatusBadge, feedbackStatusTone } from "./FeedbackPresentation";

export function FeedbackCard({ item, onPress, children }) {
  const tone = feedbackStatusTone(item.status);
  const status = statusLabels[item.status] || "Chưa xác định trạng thái";
  const type = typeLabels[item.type] || "Đóng góp ý kiến";
  return (
    <Card mode="outlined" onPress={onPress}
      accessibilityLabel={`${status}. ${type}. Xem chi tiết đóng góp`}
      style={[styles.card, { borderLeftColor: tone.color }]}>
      <Card.Content style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.type}>{type}</Text>
          <FeedbackStatusBadge status={item.status} />
        </View>
        <Text numberOfLines={3} style={styles.description}>{item.description}</Text>
        {children}
        <View style={styles.footer}>
          <Text style={styles.metadata}>{item.created_at ? feedbackTime(item.created_at) : "Chưa có thời gian"}</Text>
          <View style={styles.detailLink}>
            <Text style={styles.detailText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} accessible={false} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

// Manager thêm thông tin người gửi; Customer dùng cùng thẻ với trạng thái và màu.
export default function ManagerFeedbackCard({ item, onPress }) {
  return <FeedbackCard item={item} onPress={onPress}>
    <View style={styles.senderRow}>
      <Ionicons name="person-outline" size={16} color={colors.textSecondary} accessible={false} />
      <View style={styles.sender}>
        <Text style={styles.senderName}>{item.sender?.fullName || "Tài khoản không còn khả dụng"}</Text>
        {!!item.sender?.email && <Text style={styles.metadata}>{item.sender.email}</Text>}
      </View>
    </View>
  </FeedbackCard>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.card, borderColor: colors.border, borderLeftWidth: 4 },
  content: { gap: spacing.md },
  heading: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  type: { ...typography.label, color: colors.textSecondary, flexShrink: 1 },
  description: { ...typography.body, color: colors.textPrimary },
  senderRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  sender: { flex: 1, minWidth: 0, gap: spacing.xs },
  senderName: { ...typography.label, color: colors.textPrimary },
  metadata: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 },
  footer: { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md,
    flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  detailLink: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  detailText: { ...typography.caption, color: colors.primary, fontWeight: "600" },
});
