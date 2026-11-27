import AnalysisScreen from "../../src/components/diagnosis/AnalysisScreen";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../src/components/common/ScreenHeader";
import LoadingState from "../../src/components/common/LoadingState";
import ListError from "../../src/components/common/ListError";
import useGardenPlant from "../../src/hooks/useGardenPlant";

function GardenDiagnosis({ id }) {
  const router = useRouter();
  const { plant, loading, error, retry } = useGardenPlant(id);
  if (plant?._id === id && !plant.archived_at)
    return <AnalysisScreen gardenPlant={plant} />;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Chẩn đoán cây" onBack={() => router.canGoBack()
        ? router.back() : router.replace("/customer/garden")} />
      {loading ? <LoadingState message="Đang tải thông tin cây…" /> :
        <ListError message={error || "Cây không còn trong vườn."} onRetry={retry} />}
    </SafeAreaView>
  );
}

export default function DiagnosisScreen() {
  const { userPlantId } = useLocalSearchParams();
  return typeof userPlantId === "string" && userPlantId
    ? <GardenDiagnosis key={userPlantId} id={userPlantId} />
    : <AnalysisScreen />;
}
