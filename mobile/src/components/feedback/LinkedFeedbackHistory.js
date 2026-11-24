import { componentStyles } from "../../theme/componentStyles";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import DiagnosisHistoryPhoto from "../diagnosis/DiagnosisHistoryPhoto";
import { feedbackTime } from "./feedbackLabels";
import { FeedbackField, FeedbackSection, presentation } from "./FeedbackPresentation";

export function historyKindLabel(history) {
  return history.result_kind === "plant" ? "Nhận diện cây" : "Chẩn đoán bệnh";
}

export default function LinkedFeedbackHistory({ history, managerFeedbackId }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <FeedbackSection title="Kết quả đã liên kết" icon="link-outline">
      {history ? <>
        <FeedbackField label="Loại kết quả" value={historyKindLabel(history)} />
        <View style={presentation.fields}>
          <View style={presentation.fieldColumn}>
            <FeedbackField label="Tên cây" value={history.plant_name || "Không còn thông tin"} />
          </View>
          {history.result_kind !== "plant" && <View style={presentation.fieldColumn}>
            <FeedbackField label="Bệnh được chẩn đoán" value={history.disease_name || "Không còn thông tin"} />
          </View>}
        </View>
        <FeedbackField label="Thời gian ghi nhận" value={history.created_at ? feedbackTime(history.created_at) : "Chưa có thời gian"} />
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
          mode="outlined" onPress={() => setExpanded(!expanded)} accessibilityState={{ expanded }}>
          {expanded ? "Thu gọn kết quả" : "Xem kết quả đã liên kết"}
        </Button>
        {expanded && <>
          {Number.isFinite(history.confidence) && <FeedbackField label="Điểm tin cậy AI" value={`${(history.confidence * 100).toFixed(1)}%`} />}
          <DiagnosisHistoryPhoto diagnosisId={history._id} hasImage={history.has_image}
            managerFeedbackId={managerFeedbackId} large />
        </>}
      </> : <Text style={presentation.hint}>Kết quả đã liên kết không còn khả dụng.</Text>}
    </FeedbackSection>
  );
}
