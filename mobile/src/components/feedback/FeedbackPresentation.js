import StatusBadge from "../common/StatusBadge";
export { default as FeedbackSection } from "../common/SectionCard";
export { default as FeedbackField } from "../common/DetailField";
import { StyleSheet } from "react-native";


import { colors, radius, spacing, typography } from "../../theme";
import { statusLabels } from "./feedbackLabels";

const STATUS_META = {
  pending: { color: colors.statusWarning, background: colors.warningBackground, icon: "time-outline" },
  accepted: { color: colors.statusSuccess, background: colors.lightMint, icon: "checkmark-circle-outline" },
  rejected: { color: colors.statusError, background: colors.errorBackground, icon: "close-circle-outline" },
};
const UNKNOWN_STATUS = { color: colors.textSecondary, background: colors.borderLight, icon: "help-circle-outline" };
export const feedbackStatusTone = status => STATUS_META[status] || UNKNOWN_STATUS;

export function FeedbackStatusBadge({ status }) {
  const tone = feedbackStatusTone(status);
  return <StatusBadge label={statusLabels[status] || "Chưa xác định trạng thái"} icon={tone.icon} tone={tone} />;
}

export const presentation = StyleSheet.create({
  section: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.card },
  content: { gap: spacing.lg, paddingVertical: spacing.lg },
  heading: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
    gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: spacing.md },
  headingCopy: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexShrink: 1 },
  title: { ...typography.section, color: colors.textPrimary, flexShrink: 1 },
  field: { gap: spacing.xs },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  value: { ...typography.body, color: colors.textPrimary },
  fields: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  fieldColumn: { flexGrow: 1, flexBasis: 220, minWidth: 0 },
  description: { backgroundColor: colors.softSproutBg, borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "100%",
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm },
  status: { ...typography.label, flexShrink: 1 },
  hint: { ...typography.caption, color: colors.textSecondary },
});
