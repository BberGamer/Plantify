import { useState } from "react";
import { Button, Card, Text } from "react-native-paper";
import DiagnosisHistoryPhoto from "../diagnosis/DiagnosisHistoryPhoto";
import { feedbackStyles as styles, feedbackTime } from "./FeedbackFrame";

export function historyKindLabel(history) {
  return history.result_kind === "plant" ? "Nhận diện cây" : "Chẩn đoán bệnh";
}

export default function LinkedFeedbackHistory({ history, managerFeedbackId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.group}>
        <Text variant="titleMedium">Kết quả đã liên kết</Text>
        {history ? (
          <>
            <Text variant="labelLarge">{historyKindLabel(history)}</Text>
            <Text>Cây: {history.plant_name || "Không còn thông tin"}</Text>
            {history.result_kind !== "plant" && (
              <Text>Bệnh: {history.disease_name || "Không còn thông tin"}</Text>
            )}
            <Text style={styles.muted}>{feedbackTime(history.created_at)}</Text>
            <Button
              mode="outlined"
              onPress={() => setExpanded(!expanded)}
              accessibilityState={{ expanded }}
            >
              {expanded ? "Thu gọn kết quả" : "Xem kết quả đã liên kết"}
            </Button>
            {expanded && (
              <>
                {Number.isFinite(history.confidence) && (
                  <Text>
                    Điểm tin cậy AI: {(history.confidence * 100).toFixed(1)}%
                  </Text>
                )}
                <DiagnosisHistoryPhoto
                  diagnosisId={history._id}
                  hasImage={history.has_image}
                  managerFeedbackId={managerFeedbackId}
                  large
                />
              </>
            )}
          </>
        ) : (
          <Text>Kết quả đã liên kết không còn khả dụng.</Text>
        )}
      </Card.Content>
    </Card>
  );
}
