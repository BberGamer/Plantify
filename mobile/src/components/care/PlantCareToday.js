import { Button, Text } from "react-native-paper";
import useCareTasks from "../../hooks/useCareTasks";
import { componentStyles } from "../../theme/componentStyles";
import { gardenToday } from "../../utils/gardenDate";
import ListError from "../common/ListError";
import SectionCard from "../common/SectionCard";
import CareTaskCard from "./CareTaskCard";

export default function PlantCareToday({ plantId, onOpenCalendar }) {
  const today = gardenToday();
  const care = useCareTasks(today, today, plantId);
  return (
    <SectionCard title="Chăm sóc hôm nay" icon="calendar-outline">
      {care.loading && <Text accessibilityLiveRegion="polite">Đang tải lịch chăm sóc…</Text>}
      {!!care.error && <ListError message={care.error} onRetry={care.reload} busy={care.busy} />}
      {!care.loading && !care.error && !care.tasks.length && <Text>Hôm nay chưa có công việc chăm sóc.</Text>}
      {!care.loading && care.tasks.map((task) => (
        <CareTaskCard
          key={`${task.schedule_id}:${task.date}`}
          task={task}
          today={today}
          busy={care.busy}
          showPlantName={false}
          onComplete={() => care.complete(task)}
        />
      ))}
      <Button
        mode="outlined"
        icon="calendar"
        style={componentStyles.buttonShape}
        contentStyle={componentStyles.button}
        onPress={onOpenCalendar}
      >
        Xem lịch chăm sóc
      </Button>
    </SectionCard>
  );
}
