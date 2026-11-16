import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { IconButton, SegmentedButtons, Text } from "react-native-paper";
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
  const showResult = !!diagnosis.result;
  const busy = capture.busy || diagnosis.busy;
  // Lỗi giải mã ảnh hiển thị ngay trong khung kết quả, không lặp lỗi ở phần camera.
  const onImageError = diagnosis.onImageError;
  // Mục đích: Đưa người dùng về đầu kết quả mới.
  // Cách chạy: Cuộn lên đầu khi state kết quả thay đổi và có dữ liệu.
  useEffect(() => {
    if (diagnosis.result) scroll.current?.scrollTo({ y: 0, animated: false });
  }, [diagnosis.result]);
  // Mục đích: Quay lại bước trước trong luồng.
  // Cách chạy: Chặn khi bận; lần lượt đóng kết quả, bỏ ảnh hoặc điều hướng về màn trước.
  const handleBack = () => {
    if (operationLock.current) return;
    if (showResult && diagnosis.result.result_status === "invalid_image") capture.retake();
    else if (showResult) diagnosis.clearResult();
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
        {!identification && <IconButton icon="history" accessibilityLabel="Xem lịch sử chẩn đoán"
          disabled={busy} onPress={() => router.push("/customer/diagnosis-history")} />}
      </View>
      <SegmentedButtons
        value={identification ? "plant" : "disease"}
        onValueChange={(value) => {
          if (busy || value === (identification ? "plant" : "disease")) return;
          router.replace(value === "plant" ? "/customer/identification" : "/customer/diagnosis");
        }}
        buttons={[
          { value: "plant", label: "Nhận diện cây", icon: "leaf-outline", disabled: busy },
          { value: "disease", label: "Chẩn đoán bệnh", icon: "stethoscope", disabled: busy },
        ]}
        style={styles.modeSelector}
      />
      <ScrollView
        ref={scroll}
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {identification && !showResult && <Text>Chụp hoặc chọn ảnh lá rõ nét để gợi ý tên cây trong bộ nhãn được hỗ trợ.</Text>}
        {showResult && identification ? (
          <IdentificationResult photo={capture.photo} result={diagnosis.result}
            onRetake={capture.retake} onImageError={onImageError} />
        ) : showResult ? (
          <DiagnosisResult
            photo={capture.photo} result={diagnosis.result}
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
            identification={identification}
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
  modeSelector: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
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
