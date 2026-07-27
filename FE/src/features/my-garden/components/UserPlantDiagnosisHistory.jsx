import { useNavigate } from "react-router";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DiagnosisHistoryList,
  useDiagnosisHistory,
} from "@/features/diagnosis-history";
import { buildPlantDiagnosisUrl } from "../myGarden.utils";

export function UserPlantDiagnosisHistory({ userPlantId }) {
  const navigate = useNavigate();
  const {
    histories,
    listLoading,
    listError,
    refreshHistories,
  } = useDiagnosisHistory({
    enabled: Boolean(userPlantId),
    historyId: "",
    userPlantId,
    limit: 8,
  });

  const openAIDoctor = (historyId = "") => {
    navigate(buildPlantDiagnosisUrl(userPlantId, historyId));
  };

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" onClick={() => openAIDoctor()}>
          <Stethoscope className="mr-2 h-4 w-4" />
          Chẩn đoán cây này
        </Button>
      </div>
      <DiagnosisHistoryList
        enabled={Boolean(userPlantId)}
        authLoading={false}
        histories={histories}
        selectedHistoryId=""
        loading={listLoading}
        error={listError}
        onSelect={openAIDoctor}
        onRetry={refreshHistories}
      />
    </div>
  );
}
