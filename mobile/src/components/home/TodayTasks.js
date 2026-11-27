import { componentStyles } from "../../theme/componentStyles";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../theme";

export default function TodayTasks({ care }) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.title}>Lịch chăm sóc hôm nay</Text>
      {care.loading ? (
        <ActivityIndicator />
      ) : care.error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>{care.error}</Text>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={care.reload}>Thử lại</Button>
        </>
      ) : (
        <>
          {!care.tasks.length && (
            <Text>Hôm nay chưa có công việc chăm sóc.</Text>
          )}
          {care.tasks.slice(0, 5).map((task) => (
            <Card
              key={`${task.schedule_id}:${task.date}`}
              style={styles.card}
            >
              <Card.Content>
                <Text variant="titleMedium">
                  {task.title} · {task.plant_name}
                </Text>
                <Text>
                  {task.time} ·{" "}
                  {task.status === "completed"
                    ? "Đã hoàn thành"
                    : task.status === "paused"
                      ? "Tạm dừng do điều trị"
                      : "Chưa hoàn thành"}
                </Text>
                {task.status === "pending" && (
                  <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
                    disabled={care.busy}
                    onPress={() => care.complete(task)}
                  >
                    Đánh dấu hoàn thành
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}
        </>
      )}
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
        icon="calendar"
        mode="outlined"
        onPress={() => router.push("/customer/care")}
      >
        Xem lịch chăm sóc
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xxxl,
    gap: spacing.md
  },
  title: {
    ...typography.section,
    color: colors.textPrimary
  },
  error: {
    ...typography.body,
    color: colors.statusError
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card
  }
});
