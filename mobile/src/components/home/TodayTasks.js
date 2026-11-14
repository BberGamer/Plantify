import { View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import useCareTasks, { gardenToday } from "../../hooks/useCareTasks";

export default function TodayTasks() {
  const router = useRouter();
  const care = useCareTasks(gardenToday());
  return <View style={{ marginTop: 24, gap: 12 }}>
    <Text variant="titleLarge">Chăm sóc thường hôm nay</Text>
    {care.loading ? <ActivityIndicator /> : care.error ? <><Text>{care.error}</Text><Button onPress={care.reload}>Thử lại</Button></> : <>
      {!care.tasks.length && <Text>Chưa có lịch tưới nước hoặc bón phân hôm nay.</Text>}
      {care.tasks.slice(0, 5).map(task => <Card key={`${task.schedule_id}:${task.date}`} style={{ backgroundColor: "white" }}><Card.Content>
        <Text variant="titleMedium">{task.title} · {task.plant_name}</Text>
        <Text>{task.time} · {task.status === "completed" ? "Đã hoàn thành" : task.status === "paused" ? "Tạm dừng do điều trị" : "Chưa hoàn thành"}</Text>
        {task.status === "pending" && <Button disabled={care.busy} onPress={() => care.complete(task)}>Đánh dấu hoàn thành</Button>}
      </Card.Content></Card>)}
    </>}
    <Button icon="calendar" mode="outlined" onPress={() => router.push("/customer/care")}>Xem lịch chăm sóc</Button>
  </View>;
}
