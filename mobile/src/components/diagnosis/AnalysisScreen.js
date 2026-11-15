import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "../../theme";
import DiagnosisCapture from "./DiagnosisCapture";
import DiagnosisPreview from "./DiagnosisPreview";
import DiagnosisResult from "./DiagnosisResult";
import IdentificationResult from "./IdentificationResult";
import useDiagnosisCapture from "../../hooks/useDiagnosisCapture";
import useFormBack from "../../hooks/useFormBack";
import useDiagnosis from "../../hooks/useDiagnosis";

// Mục đích: Hiển thị luồng chụp ảnh và chẩn đoán.
// Cách chạy: Ghép hook camera/phân tích, chọn màn chụp, xem ảnh hoặc kết quả theo state.
export default function AnalysisScreen({ identification = false }) {
  const router = useRouter();
  const operationLock = useRef(null);
  const capture = useDiagnosisCapture(operationLock);
  const diagnosis = useDiagnosis(capture.photo, operationLock, identification);
  const scroll = useRef(null);
  const showResult = !!diagnosis.result && !diagnosis.imageInvalid;
  const busy = capture.busy || diagnosis.busy;
  // Mục đích: Đồng bộ lỗi ảnh giữa hai hook.
  // Cách chạy: Gọi xử lý lỗi của camera và phân tích để ngừng dùng ảnh hỏng.
  const onImageError = () => { capture.onImageError(); diagnosis.onImageError(); };
  // Mục đích: Đưa người dùng về đầu kết quả mới.
  // Cách chạy: Cuộn lên đầu khi state kết quả thay đổi và có dữ liệu.
  useEffect(() => {
    if (diagnosis.result) scroll.current?.scrollTo({ y: 0, animated: false });
  }, [diagnosis.result]);
  // Mục đích: Quay lại bước trước trong luồng.
  // Cách chạy: Chặn khi bận; lần lượt đóng kết quả, bỏ ảnh hoặc điều hướng về màn trước.
  const handleBack = () => {
    if (operationLock.current) return;
    if (showResult) diagnosis.clearResult();
    else if (capture.photo) capture.retake();
    else if (router.canGoBack()) router.back();
    else router.replace("/customer/home");
  };
  useFormBack(handleBack, busy);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={handleBack}
          disabled={busy}
          accessibilityLabel="Quay lại"
        />
        <Text style={styles.title}>{identification ? (showResult ? "Kết quả nhận diện cây" : "Nhận diện cây") : (showResult ? "Kết quả chẩn đoán" : "Chẩn đoán bệnh")}</Text>
      </View>
      <ScrollView
        ref={scroll}
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {identification && !showResult && <Text>Chụp hoặc chọn ảnh lá rõ nét để gợi ý tên cây trong bộ nhãn được hỗ trợ.</Text>}
        {showResult && identification ? (
          <IdentificationResult photo={capture.photo} result={diagnosis.result}
            onBack={diagnosis.clearResult} onRetake={capture.retake} onImageError={onImageError} />
        ) : showResult ? (
          <DiagnosisResult
            photo={capture.photo} result={diagnosis.result} onBack={diagnosis.clearResult}
            onRetake={capture.retake} onImageError={onImageError}
            onCreateTreatment={() =>
              router.push({
                pathname: "/customer/treatments/preview",
                params: {
                  diagnosisId: diagnosis.result.diagnosis_id,
                  plantId: diagnosis.result.prediction.plant_id,
                  diseaseId: diagnosis.result.prediction.disease_id,
                },
              })
            }
          />
        ) : capture.photo ? (
          <DiagnosisPreview
            photo={capture.photo} busy={busy} analyzing={diagnosis.busy}
            imageInvalid={diagnosis.imageInvalid} onRetake={capture.retake}
            onPickPhoto={capture.pickPhoto} onImageError={onImageError}
            onAnalyze={diagnosis.analyze}
          />
        ) : (
          <DiagnosisCapture
            cameraRef={capture.camera} showCamera={capture.showCamera}
            permission={capture.permission} cameraError={capture.cameraError}
            busy={busy} canCapture={capture.canCapture && !busy}
            onCameraReady={capture.onCameraReady} onCameraError={capture.onCameraError}
            onEnableCamera={capture.enableCamera} onRetryCamera={capture.retryCamera}
            onCapture={capture.takePhoto} onPickPhoto={capture.pickPhoto}
          />
        )}
        {!!(diagnosis.error || capture.error) && (
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {diagnosis.error || capture.error}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.xl,
  },
  title: { ...typography.section, flex: 1, color: colors.textPrimary },
  body: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  error: {
    ...typography.caption,
    color: colors.statusError,
    textAlign: "center",
  },
});
