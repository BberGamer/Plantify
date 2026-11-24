import { componentStyles } from "../../../../src/theme/componentStyles";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Portal, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../../../src/theme";
import { useActiveTreatment } from "../../../../src/hooks/useTreatment";
import {
  TreatmentHeader,
  TreatmentProgress,
  TreatmentSafetyNotice,
  TreatmentStateView,
  TreatmentSummary,
  TreatmentTaskCard,
  TreatmentTaskEditDialog,
  TreatmentTimeline,
} from "../../../../src/components/treatments";

const date = (value) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));

export default function TreatmentListScreen() {
  const router = useRouter();
  const { treatmentId: routeTreatmentId } = useLocalSearchParams();
  const treatmentId =
    typeof routeTreatmentId === "string" ? routeTreatmentId : "";
  const treatment = useActiveTreatment(treatmentId);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const data = treatment.data;

  async function completeTask(task) {
    treatment.clearMutationError();
    await treatment.completeTask(task._id);
  }

  async function saveTask(payload) {
    const saved = await treatment.editTask(taskToEdit._id, payload);
    if (saved) setTaskToEdit(null);
  }

  function beginEdit(task) {
    treatment.clearMutationError();
    setTaskToEdit(task);
  }

  const currentStage = data?.stages.find((stage) => stage.order === data.current_stage_order);

  return <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <TreatmentHeader title="Phác đồ điều trị" onBack={() => router.back()} />
    {treatment.loading || treatment.error || !data ? (
      <TreatmentStateView loading={treatment.loading} error={treatment.error} empty={!treatment.loading && !treatment.error ? "Cây này chưa có đợt điều trị đang hoạt động." : ""} onRetry={treatment.retry} />
    ) : <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={treatment.refreshing} onRefresh={treatment.refresh} colors={[colors.primary]} />}
    >
      {!!treatment.successMessage && <View style={styles.success}><Text style={styles.successText} accessibilityRole="alert">{treatment.successMessage}</Text></View>}
      {!!treatment.mutationError && <Text style={styles.error} accessibilityRole="alert">{treatment.mutationError}</Text>}
      <TreatmentSummary
        plant={data.plant}
        disease={data.disease}
        status={data.status}
        style={styles.summary}
        imageStyle={styles.image}
      >
        <Text style={styles.dates}>{date(data.started_at)} – {date(data.estimated_end_at)}</Text>
      </TreatmentSummary>
      <TreatmentProgress currentDay={treatment.progress.currentDay} duration={treatment.progress.duration} completedTasks={treatment.progress.completedTasks} totalTasks={treatment.progress.totalTasks} />
      {currentStage && <View style={styles.currentStage}>
        <Text style={styles.eyebrow}>GIAI ĐOẠN HIỆN TẠI</Text>
        <Text style={styles.sectionTitle}>{currentStage.title}</Text>
        <Text style={styles.body}>Ngày {currentStage.start_day}–{currentStage.end_day}</Text>
        <Text style={styles.body}>{currentStage.instructions[0]}</Text>
      </View>}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Công việc điều trị</Text>
        {data.task_progress.length ? data.task_progress.map((task) => <TreatmentTaskCard key={task._id} task={task} editable={data.status === "in_progress"} busy={treatment.completingTaskId === task._id || treatment.editingTaskId === task._id} onComplete={completeTask} onEdit={beginEdit} />) : <Text style={styles.empty}>Hôm nay chưa có công việc điều trị.</Text>}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Các giai đoạn</Text>
        <TreatmentTimeline stages={data.stages} currentStageOrder={data.current_stage_order} />
      </View>
      <TreatmentSafetyNotice>{data.protocol.safety_note}</TreatmentSafetyNotice>
      {!!data.protocol.reference_notice && (
        <Text style={styles.notice} accessibilityRole="alert">
          {data.protocol.reference_notice}
        </Text>
      )}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Lịch sử điều trị</Text>
        {data.history.map((item) => <View key={item._id} style={styles.history}>
          <Text style={styles.historyDate}>{date(item.occurred_at)}</Text>
          <Text style={styles.body}>{item.title}</Text>
        </View>)}
      </View>
      {data.status === "in_progress" && <Button style={componentStyles.buttonShape} mode="contained" icon="clipboard-check-outline" contentStyle={styles.completionButton} onPress={() => router.push({ pathname: "/customer/treatments/TreatmentList/complete", params: { treatmentId: data._id } })}>
        Đánh giá kết quả điều trị
      </Button>}
    </ScrollView>}
    <Portal>
      <TreatmentTaskEditDialog
        task={taskToEdit}
        busy={Boolean(treatment.editingTaskId)}
        serverError={treatment.mutationError}
        scheduleStart={data?.started_at}
        scheduleEnd={data?.estimated_end_at}
        onDismiss={() => !treatment.editingTaskId && setTaskToEdit(null)}
        onSave={saveTask}
      />
    </Portal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flex: 1
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 20,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg
  },
  success: {
    backgroundColor: colors.lightMint,
    borderRadius: radius.md,
    padding: spacing.md
  },
  successText: {
    ...typography.body,
    color: colors.primaryLight,
    textAlign: "center"
  },
  error: {
    ...typography.body,
    color: colors.statusError,
    textAlign: "center"
  },
  notice: {
    ...typography.body,
    color: colors.statusWarning,
    backgroundColor: colors.warmPeachBg,
    borderRadius: radius.md,
    padding: spacing.md
  },
  summary: {
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  image: {
    width: 108,
    height: 108,
    borderRadius: radius.card
  },
  dates: {
    ...typography.caption,
    color: colors.textMuted
  },
  currentStage: {
    backgroundColor: colors.softMintBg,
    borderWidth: 1,
    borderColor: colors.lightMint,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm
  },
  eyebrow: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: "800"
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    ...typography.section,
    color: colors.textPrimary
  },
  body: {
    ...typography.body,
    color: colors.textSecondary
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    padding: spacing.xl
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.lg
  },
  history: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md
  },
  historyDate: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  completionButton: {
    minHeight: 48
  }
});
