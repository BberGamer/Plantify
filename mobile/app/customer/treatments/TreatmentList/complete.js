import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../../../src/theme";
import { useTreatmentCompletion } from "../../../../src/hooks/useTreatment";
import {
  TreatmentHeader,
  TreatmentProgress,
  TreatmentSafetyNotice,
  TreatmentStateView,
} from "../../../../src/components/treatments";

const OUTCOMES = [
  { value: "recovered", title: "Cây đã hồi phục", description: "Triệu chứng đã giảm và cây đang phát triển ổn định." },
  { value: "failed", title: "Cây chưa hồi phục", description: "Cây vẫn còn triệu chứng hoặc tình trạng chưa cải thiện." },
  { value: "cancelled", title: "Dừng điều trị", description: "Huỷ đợt điều trị hiện tại và dừng các nhắc việc còn lại." },
];

export default function TreatmentListCompletionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { treatmentId: routeTreatmentId } = useLocalSearchParams();
  const treatmentId =
    typeof routeTreatmentId === "string" ? routeTreatmentId : "";
  const completion = useTreatmentCompletion(treatmentId);
  const data = completion.data;
  const allTasksCompleted =
    completion.progress.totalTasks > 0 &&
    completion.progress.completedTasks === completion.progress.totalTasks;

  return <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <TreatmentHeader title="Đánh giá điều trị" onBack={() => router.back()} />
    {completion.loading || completion.error || !data ? (
      <TreatmentStateView loading={completion.loading} error={completion.error} empty={!completion.loading && !completion.error ? "Không có đợt điều trị để đánh giá." : ""} onRetry={completion.retry} />
    ) : completion.completed ? (
      <ScrollView contentContainerStyle={styles.resultContent}>
        <View style={[styles.resultIcon, completion.outcome === "recovered" ? styles.recovered : styles.failed]}>
          <Text style={styles.resultIconText}>{completion.outcome === "recovered" ? "✓" : "!"}</Text>
        </View>
        <Text style={styles.resultTitle}>{completion.outcome === "recovered" ? "Hoàn thành điều trị" : completion.outcome === "cancelled" ? "Đã dừng điều trị" : "Đã lưu kết quả theo dõi"}</Text>
        <Text style={styles.resultBody}>{completion.outcome === "recovered" ? "Cây được ghi nhận đã hồi phục. Hãy tiếp tục theo dõi trong những ngày tới." : completion.outcome === "cancelled" ? "Đợt điều trị đã được huỷ và các nhắc việc còn lại đã dừng." : "Cây chưa hồi phục. Không tự tăng liều lượng; hãy kiểm tra lại tình trạng hoặc chẩn đoán lại."}</Text>
        <Button mode="contained" onPress={() => router.replace("/customer/garden")} contentStyle={styles.buttonContent}>Trở về Vườn cây</Button>
      </ScrollView>
    ) : <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TreatmentProgress currentDay={completion.progress.currentDay} duration={completion.progress.duration} completedTasks={completion.progress.completedTasks} totalTasks={completion.progress.totalTasks} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kết quả theo dõi</Text>
          <Text style={styles.body}>Chọn tình trạng phù hợp nhất với cây sau quá trình điều trị.</Text>
          {OUTCOMES.map((item) => {
            const selected = completion.outcome === item.value;
            return <Button key={item.value} mode={selected ? "contained" : "outlined"} onPress={() => completion.selectOutcome(item.value)} disabled={item.value === "recovered" && !allTasksCompleted} contentStyle={styles.outcomeContent} style={styles.outcomeButton}>
              {item.title}
            </Button>;
          })}
          {!allTasksCompleted && <Text style={styles.hint}>Hoàn thành tất cả công việc trước khi ghi nhận cây đã hồi phục. Bạn vẫn có thể chọn chưa hồi phục hoặc dừng điều trị.</Text>}
        </View>
        <TextInput
          mode="outlined"
          label="Ghi chú theo dõi (không bắt buộc)"
          value={completion.note}
          onChangeText={completion.changeNote}
          multiline
          numberOfLines={4}
          maxLength={1000}
          disabled={completion.submitting}
        />
        <TreatmentSafetyNotice>Không tự tăng liều lượng hoặc kết hợp thêm sản phẩm nếu cây chưa hồi phục.</TreatmentSafetyNotice>
        {!!completion.submitError && <Text style={styles.error} accessibilityRole="alert">{completion.submitError}</Text>}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button mode="contained" onPress={completion.submit} loading={completion.submitting} disabled={!completion.outcome || completion.submitting} contentStyle={styles.buttonContent}>Lưu kết quả điều trị</Button>
      </View>
    </>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  section: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  sectionTitle: { ...typography.section, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  hint: { ...typography.caption, color: colors.textMuted },
  outcomeButton: { borderRadius: radius.md },
  outcomeContent: { minHeight: 48 },
  error: { ...typography.body, color: colors.statusError, textAlign: "center" },
  footer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  buttonContent: { minHeight: 48 },
  resultContent: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.lg },
  resultIcon: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  recovered: { backgroundColor: colors.lightMint },
  failed: { backgroundColor: colors.errorBackground },
  resultIconText: { fontSize: 36, fontWeight: "800", color: colors.primaryLight },
  resultTitle: { ...typography.title, color: colors.textPrimary, textAlign: "center" },
  resultBody: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
