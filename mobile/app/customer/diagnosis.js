import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "../../src/theme";
import DiagnosisCapture from "../../src/components/diagnosis/DiagnosisCapture";
import DiagnosisPreview from "../../src/components/diagnosis/DiagnosisPreview";
import DiagnosisResult from "../../src/components/diagnosis/DiagnosisResult";
import useDiagnosisCapture from "../../src/hooks/useDiagnosisCapture";
import useFormBack from "../../src/hooks/useFormBack";
import useDiagnosis from "../../src/hooks/useDiagnosis";

export default function DiagnosisScreen() {
  const router = useRouter();
  const operationLock = useRef(null);
  const capture = useDiagnosisCapture(operationLock);
  const diagnosis = useDiagnosis(capture.photo, operationLock);
  const scroll = useRef(null);
  const showResult = !!diagnosis.result && !diagnosis.imageInvalid;
  const busy = capture.busy || diagnosis.busy;
  const onImageError = () => { capture.onImageError(); diagnosis.onImageError(); };
  useEffect(() => {
    if (diagnosis.result) scroll.current?.scrollTo({ y: 0, animated: false });
  }, [diagnosis.result]);
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
        <Text style={styles.title}>{showResult ? "Kết quả chẩn đoán" : "Chẩn đoán bệnh"}</Text>
      </View>
      <ScrollView
        ref={scroll}
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {showResult ? (
          <DiagnosisResult
            photo={capture.photo} result={diagnosis.result} onBack={diagnosis.clearResult}
            onRetake={capture.retake} onImageError={onImageError}
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
