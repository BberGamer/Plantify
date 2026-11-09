import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { colors, spacing } from "../../theme";

export default function ChatEvaluation({ evaluation, onRetry }) {
  if (!evaluation || evaluation.status === "disabled") return null;
  if (["processing", "not_requested"].includes(evaluation.status)) return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <ActivityIndicator size="small" />
      <Text style={styles.note}>Đang đánh giá CCC… Câu trả lời đã được hiển thị.</Text>
      {evaluation.status === "processing" && <Button onPress={onRetry}>Kiểm tra kết quả</Button>}
    </View>
  );
  if (evaluation.status !== "completed") return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <Text style={styles.note}>{evaluation.message || "Chưa chấm được câu trả lời."}</Text>
      {evaluation.status === "failed" && evaluation.error_code !== "EVALUATION_RETRY_LIMIT" &&
        <Button onPress={onRetry}>Thử đánh giá lại</Button>}
    </View>
  );
  const criteria = evaluation.criteria;
  if (!criteria || !Number.isFinite(evaluation.composite)) return null;
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <Text style={styles.title}>Đánh giá CCC: {evaluation.composite.toFixed(2)}/5</Text>
      <Text style={styles.note}>{evaluation.provisional ?
        "Đánh giá tham khảo: đáp án mẫu chưa được xác minh nguồn." : "Nguồn tham chiếu đã được duyệt theo hồ sơ lưu trữ."}</Text>
      <View style={styles.row}>
        <Text style={styles.name}>Tiêu chí</Text><Text style={styles.score}>Điểm</Text><Text style={styles.weight}>Trọng số</Text>
      </View>
      {[["correctness", "Độ chính xác"], ["completeness", "Độ đầy đủ"], ["communication", "Truyền đạt"]].map(([key, label]) => (
        <View key={key} style={styles.criterion}>
          <View style={styles.row}><Text style={styles.name}>{label}</Text>
            <Text style={styles.score}>{criteria[key].score}/5</Text>
            <Text style={styles.weight}>{Math.round(criteria[key].weight * 100)}%</Text></View>
          <Text selectable style={styles.body}>{criteria[key].comment}</Text>
          {!!criteria[key].evidence && <Text selectable style={styles.note}>Dẫn chứng: “{criteria[key].evidence}”</Text>}
        </View>
      ))}
      {!!evaluation.issues?.length && <Text selectable style={styles.body}>Vấn đề phát hiện:{"\n"}{evaluation.issues.map((x, i) => `${i + 1}. ${x}`).join("\n")}</Text>}
      {!!evaluation.improvements?.length && <Text selectable style={styles.body}>Đề xuất cải thiện:{"\n"}{evaluation.improvements.slice(0, 3).map((x, i) => `${i + 1}. ${x}`).join("\n")}</Text>}
      <Text selectable style={styles.body}>Kết luận: {evaluation.conclusion}</Text>
      {!!evaluation.verification_limit && <Text style={styles.note}>{evaluation.verification_limit}</Text>}
      {evaluation.markdown_issue && <Text style={styles.note}>Lỗi trình bày: có ký tự Markdown trong câu trả lời; ghi nhận riêng.</Text>}
      <Text style={styles.note}>{evaluation.disclaimer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  title: { fontSize: 16, fontWeight: "700", color: colors.primary },
  row: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.xs },
  name: { flex: 1, color: colors.textPrimary, fontWeight: "600" },
  score: { width: 42, color: colors.textPrimary },
  weight: { width: 65, color: colors.textPrimary },
  criterion: { gap: spacing.xs, paddingBottom: spacing.sm },
  body: { fontSize: 14, lineHeight: 21, color: colors.textPrimary },
  note: { fontSize: 12, lineHeight: 18, color: colors.textSecondary },
});
