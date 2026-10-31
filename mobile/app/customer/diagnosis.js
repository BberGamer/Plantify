import { ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "../../src/theme";
import DiagnosisCapture from "../../src/components/diagnosis/DiagnosisCapture";

export default function DiagnosisScreen() {
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/customer");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={handleBack}
          accessibilityLabel="Quay lại"
        />
        <Text style={styles.title}>Chẩn đoán bệnh</Text>
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DiagnosisCapture />
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
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    gap: spacing.lg,
  },
  notice: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
