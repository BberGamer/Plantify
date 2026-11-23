import { useLocalSearchParams } from "expo-router";
import FeedbackFormScreen from "../../../src/components/feedback/FeedbackFormScreen";

export default function CreateFeedbackRoute() {
  const { diagnosisId } = useLocalSearchParams();
  const id = typeof diagnosisId === "string" ? diagnosisId : undefined;
  return <FeedbackFormScreen key={id} diagnosisId={id} />;
}
