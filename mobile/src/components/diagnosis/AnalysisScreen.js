import ScreenHeader from "../common/ScreenHeader";
import ActionNoticeDialog from "../common/ActionNoticeDialog";
import { componentStyles } from "../../theme/componentStyles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";
import DiagnosisCapture from "./DiagnosisCapture";
import DiagnosisPreview from "./DiagnosisPreview";
import DiagnosisResult from "./DiagnosisResult";
import useDiagnosisCapture from "../../hooks/useDiagnosisCapture";
import useFormBack from "../../hooks/useFormBack";
import useDiagnosis from "../../hooks/useDiagnosis";

const MODES = [
  { value: "plant", label: "Nhận diện cây", icon: "leaf-outline" },
  { value: "disease", label: "Chẩn đoán bệnh", icon: "medkit-outline" },
];

function ModeTabs({ mode, busy, dark = false, onChange }) {
  return (
    <View style={[styles.modeBar, dark && styles.modeBarDark]}>
      {MODES.map((item) => {
        const active = mode === item.value;
        return (
          <Pressable
            key={item.value}
            style={[styles.modeTab, active && !dark && styles.modeTabActive]}
            onPress={() => onChange(item.value)}
            disabled={busy}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: busy }}
          >
            <Ionicons
              name={item.icon}
              size={19}
              color={
                active
                  ? dark
                    ? colors.white
                    : colors.primary
                  : dark
                    ? "#94A19B"
                    : colors.textMuted
              }
            />
            <Text
              style={[
                styles.modeLabel,
                dark && styles.modeLabelDark,
                active && styles.modeLabelActive,
                active && dark && styles.modeLabelActiveDark,
              ]}
            >
              {item.label}
            </Text>
            {active && (
              <View
                style={[styles.activeLine, dark && styles.activeLineDark]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AnalysisScreen({ identification = false }) {
  const router = useRouter();
  const operationLock = useRef(null);
  const [mode, setMode] = useState(identification ? "plant" : "disease");
  const identificationMode = mode === "plant";
  const capture = useDiagnosisCapture(operationLock);
  const diagnosis = useDiagnosis(
    capture.photo,
    operationLock,
    identificationMode,
  );
  const scroll = useRef(null);
  const showResult = Boolean(diagnosis.result);
  const feedbackHistoryId =
    diagnosis.result?.history_id ?? diagnosis.result?.diagnosis_id;
  const busy = capture.busy || diagnosis.busy;
  const onImageError = diagnosis.onImageError;

  useEffect(() => {
    if (diagnosis.result) scroll.current?.scrollTo({ y: 0, animated: false });
  }, [diagnosis.result]);

  const changeMode = useCallback(
    (nextMode) => {
      if (busy || nextMode === mode) return;
      diagnosis.clearResult();
      setMode(nextMode);
    },
    [busy, diagnosis, mode],
  );

  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !busy &&
          Math.abs(gesture.dx) > 18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -55) changeMode("disease");
          if (gesture.dx > 55) changeMode("plant");
        },
      }),
    [busy, changeMode],
  );

  const handleBack = () => {
    if (operationLock.current) return;
    if (
      showResult &&
      ["invalid_image", "unsupported_image"].includes(
        diagnosis.result.result_status,
      )
    )
      capture.retake();
    else if (showResult) diagnosis.clearResult();
    else if (capture.photo) capture.retake();
    else if (router.canGoBack()) router.back();
    else router.replace("/customer/home");
  };
  useFormBack(handleBack, busy);

  const openPlan = (candidate, rank) => {
    if (candidate.disease_id) {
      router.push({
        pathname: "/customer/treatments/preview",
        params: {
          diagnosisId: diagnosis.result.diagnosis_id,
          rank: String(rank),
          plantId: candidate.plant_id,
          diseaseId: candidate.disease_id,
        },
      });
      return;
    }
    router.push({
      pathname: "/customer/care-generate",
      params: {
        plantId: candidate.plant_id,
        generateOnOpen: "1",
        ...(diagnosis.result.history_id && { diagnosisId: diagnosis.result.history_id, rank: String(rank) }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader
        title={showResult ? "Kết quả phân tích" : "Quét lá cây"}
        subtitle="Vuốt ngang để đổi chế độ"
        onBack={handleBack}
        disabled={busy}
      >
        <IconButton
          size={20}
          icon="history"
          accessibilityLabel="Xem lịch sử nhận diện và chẩn đoán"
          disabled={busy}
          onPress={() => router.push("/customer/diagnosis-history")}
        />
      </ScreenHeader>
      <ActionNoticeDialog {...diagnosis.noticeDialog} />

      {(capture.photo || showResult) && (
        <View style={styles.modeBarOuter}>
          <ModeTabs mode={mode} busy={busy} onChange={changeMode} />
        </View>
      )}

      <View style={styles.swipeArea} {...swipe.panHandlers}>
        <ScrollView
          ref={scroll}
          style={styles.body}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!showResult && !capture.photo && (
            <View style={styles.guide}>
              <Ionicons
                name={identificationMode ? "leaf-outline" : "scan-outline"}
                size={20}
                color={colors.primary}
              />
              <Text style={styles.guideText}>
                {identificationMode
                  ? "Đặt lá cây rõ nét vào trong khung."
                  : "Đặt vùng lá có dấu hiệu bệnh rõ nét vào trong khung."}
              </Text>
            </View>
          )}
          {showResult ? (
            <DiagnosisResult
              key={
                diagnosis.result.diagnosis_id ??
                diagnosis.result.history_id ??
                mode
              }
              photo={capture.photo}
              result={diagnosis.result}
              onRetake={capture.retake}
              onImageError={onImageError}
              onCreatePlan={openPlan}
              onOpenCatalog={(candidate) =>
                router.push({
                  pathname: "/plants/PlantList",
                  params: {
                    id: candidate.plant_id,
                    ...(candidate.disease_id
                      ? { diseaseId: candidate.disease_id }
                      : {}),
                  },
                })
              }
              onOpenHistory={() =>
                router.push({
                  pathname: "/customer/diagnosis-detail",
                  params: { diagnosisId: diagnosis.result.history_id },
                })
              }
            />
          ) : capture.photo ? (
            <DiagnosisPreview
              photo={capture.photo}
              busy={busy}
              analyzing={diagnosis.busy}
              imageInvalid={diagnosis.imageInvalid}
              onRetake={capture.retake}
              onPickPhoto={capture.pickPhoto}
              onImageError={onImageError}
              onAnalyze={diagnosis.analyze}
              identification={identificationMode}
            />
          ) : (
            <DiagnosisCapture
              cameraRef={capture.camera}
              showCamera={capture.showCamera}
              permission={capture.permission}
              cameraError={capture.cameraError}
              busy={busy}
              canCapture={capture.canCapture && !busy}
              onCameraReady={capture.onCameraReady}
              onCameraError={capture.onCameraError}
              onEnableCamera={capture.enableCamera}
              onRetryCamera={capture.retryCamera}
              onCapture={capture.takePhoto}
              onPickPhoto={capture.pickPhoto}
              modeSelector={
                <ModeTabs mode={mode} busy={busy} dark onChange={changeMode} />
              }
            />
          )}
          {!!feedbackHistoryId && (
            <Button
              style={componentStyles.buttonShape}
              contentStyle={componentStyles.button}
              mode="outlined"
              icon="message-text-outline"
              disabled={busy}
              onPress={() =>
                router.push({
                  pathname: "/customer/feedback/new",
                  params: { diagnosisId: feedbackHistoryId },
                })
              }
            >
              Đóng góp ý kiến
            </Button>
          )}
          {!!(diagnosis.error || capture.error) && (
            <Text
              style={styles.error}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {diagnosis.error || capture.error}
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modeBarOuter: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
  },
  modeBar: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    flexDirection: "row",
    padding: 4,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modeBarDark: {
    maxWidth: 560,
    borderRadius: 0,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: "#34433D",
    backgroundColor: "#17221E",
    paddingHorizontal: spacing.sm,
  },
  modeTab: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: radius.md,
    position: "relative",
  },
  modeTabActive: {
    backgroundColor: colors.softMintBg,
  },
  modeLabel: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 13,
  },
  modeLabelDark: {
    color: "#94A19B",
  },
  modeLabelActive: {
    color: colors.primary,
  },
  modeLabelActiveDark: {
    color: colors.white,
  },
  activeLine: {
    position: "absolute",
    left: "28%",
    right: "28%",
    bottom: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  activeLineDark: {
    backgroundColor: colors.white,
  },
  swipeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  guide: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.lightMint,
  },
  guideText: {
    ...typography.caption,
    flex: 1,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.statusError,
    textAlign: "center",
  },
});
