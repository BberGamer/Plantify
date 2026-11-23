import { useLocalSearchParams } from "expo-router";
import FeedbackDetailScreen from "../../../src/components/feedback/FeedbackDetailScreen";

export default function CustomerFeedbackDetailRoute() {
  const { id, sent } = useLocalSearchParams();
  return <FeedbackDetailScreen key={id} id={id} sent={sent === "1"} />;
}
