import { ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "../../src/theme";
import DiagnosisCapture from "../../src/components/diagnosis/DiagnosisCapture";
import DiagnosisPreview from "../../src/components/diagnosis/DiagnosisPreview";
import useDiagnosisCapture from "../../src/hooks/useDiagnosisCapture";
import useFormBack from "../../src/hooks/useFormBack";

export default function DiagnosisScreen() {
  const router = useRouter();
  const capture = useDiagnosisCapture();
  const handleBack = () => {
    if (capture.photo) capture.retake();
    else if (router.canGoBack()) router.back();
    else router.replace("/customer");
  };
  useFormBack(handleBack, capture.busy);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={handleBack}
          disabled={capture.busy}
          accessibilityLabel="Quay lại"
        />
        <Text style={styles.title}>Chẩn đoán bệnh</Text>
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {capture.photo ? (
          <DiagnosisPreview
            photo={capture.photo} busy={capture.busy} onRetake={capture.retake}
            onPickPhoto={capture.pickPhoto} onImageError={capture.onImageError}
          />
        ) : (
          <DiagnosisCapture
            cameraRef={capture.camera} showCamera={capture.showCamera}
            permission={capture.permission} cameraError={capture.cameraError}
            busy={capture.busy} canCapture={capture.canCapture}
            onCameraReady={capture.onCameraReady} onCameraError={capture.onCameraError}
            onEnableCamera={capture.enableCamera} onRetryCamera={capture.retryCamera}
            onCapture={capture.takePhoto} onPickPhoto={capture.pickPhoto}
          />
        )}
        {!!capture.error && (
          <Text style={styles.error} accessibilityRole="alert">{capture.error}</Text>
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
