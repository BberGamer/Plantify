import { useLocalSearchParams } from "expo-router";
import FeedbackDetailScreen from "../../../src/components/feedback/FeedbackDetailScreen";

export default function ManagerFeedbackDetailRoute() {
  const { id } = useLocalSearchParams();
  return <FeedbackDetailScreen key={id} id={id} manager />;
}
