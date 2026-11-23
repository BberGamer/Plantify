import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import useAuthStore from "../../../store/authStore";
import diagnosisService from "../../services/diagnosisService";
import feedbackService from "../../services/feedbackService";
import { getSessionContext, isSessionCurrent } from "../../services/sessionAccess";
import { colors } from "../../theme";

export default function DiagnosisHistoryPhoto({ diagnosisId, hasImage, large = false, managerFeedbackId }) {
  const version = useAuthStore(state => state.sessionVersion);
  const key = `${diagnosisId}:${managerFeedbackId ?? ''}:${version}:${!!hasImage}`;
  const [photo, setPhoto] = useState({ key: null });
  useEffect(() => {
    const controller = new AbortController();
    const context = getSessionContext();
    let objectUrl;
    const current = () => !controller.signal.aborted && isSessionCurrent(context);
    setPhoto({ key });
    if (hasImage && context.token) {
      const load = async () => {
        try {
          let source;
          if (Platform.OS === "web") {
            const blob = managerFeedbackId
              ? await feedbackService.managerHistoryImage(managerFeedbackId, controller.signal)
              : await diagnosisService.historyImage(diagnosisId, { signal: controller.signal });
            if (!current()) return;
            objectUrl = URL.createObjectURL(blob);
            source = { uri: objectUrl };
          } else {
            const uri = managerFeedbackId
              ? feedbackService.managerHistoryImageUrl(managerFeedbackId)
              : diagnosisService.historyImageUrl(diagnosisId);
            source = { uri, headers: { Authorization: `Bearer ${context.token}` } };
          }
          if (current()) setPhoto({ key, source });
        } catch {
          if (current()) setPhoto({ key, error: true });
        }
      };
      load();
    }
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [key, diagnosisId, hasImage, managerFeedbackId]);
  const current = photo.key === key ? photo : {};
  return (
    <View style={[styles.frame, large ? styles.large : styles.thumbnail]}>
      {current.source && !current.error ? (
        <Image source={current.source} style={styles.image} resizeMode={large ? "contain" : "cover"}
          accessibilityLabel="Ảnh của lần nhận diện hoặc chẩn đoán"
          onError={() => setPhoto(previous => previous.key === key ? { key, error: true } : previous)} />
      ) : <Text style={styles.placeholder}>
        {!hasImage ? "Không có ảnh lưu" : current.error ? "Ảnh không còn khả dụng" : "Đang tải ảnh..."}
      </Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 12, backgroundColor: colors.lightMint, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  thumbnail: { width: 88, height: 88 },
  large: { width: "100%", aspectRatio: 1.2 },
  image: { width: "100%", height: "100%" },
  placeholder: { padding: 8, fontSize: 12, textAlign: "center", color: colors.textSecondary },
});
