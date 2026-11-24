import { componentStyles } from "../../theme/componentStyles";
import { colors, radius } from "../../theme";
import React from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Button, Card, ProgressBar, Text } from "react-native-paper";

export default function GardenSummary({ summary }) {
  const router = useRouter();
  const openGarden = () => router.navigate("/customer/garden");
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Vườn cây của bạn</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openGarden}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>Xem vườn</Text>
        </TouchableOpacity>
      </View>

      <Card mode="contained" style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{summary.total}</Text>
            <Text style={styles.statLabel}>Tổng số cây</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: colors.primaryLight }]}>
              {summary.healthy}
            </Text>
            <Text style={styles.statLabel}>Khỏe mạnh</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: colors.statusWarning }]}>
              {summary.treatment}
            </Text>
            <Text style={styles.statLabel}>Đang điều trị</Text>
          </View>
        </View>

        <View style={styles.healthSection}>
          <View style={styles.healthLabelRow}>
            <Text style={styles.healthTitle}>Sức khỏe tổng quan</Text>
            <Text style={styles.healthValue}>
              {summary.total
                ? `${Math.round(summary.healthyRatio * 100)}% khỏe mạnh`
                : "Chưa có cây"}
            </Text>
          </View>
          <ProgressBar
            progress={summary.healthyRatio}
            color={colors.primaryLight}
            style={styles.progressTrack}
          />
        </View>

        <Button
          onPress={openGarden}
          mode="contained"
          buttonColor={colors.lightMint}
          textColor={colors.primary}
          contentStyle={styles.cardButtonContent}
          labelStyle={styles.buttonText}
          style={[styles.cardButton, componentStyles.buttonShape]}
        >
          Xem vườn của tôi
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  title: {
    lineHeight: 26,
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary
  },
  linkText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.primaryLight
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    elevation: 0
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4
  },
  statCol: {
    flex: 1,
    alignItems: "center"
  },
  statNumber: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.textPrimary
  },
  statLabel: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 4
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border
  },
  healthSection: {
    marginTop: 18
  },
  healthLabelRow: {
    flexWrap: "wrap",
    gap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  healthTitle: {
    fontSize: 13,
    color: colors.textPrimary
  },
  healthValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryLight
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F5ECE1",
    overflow: "hidden"
  },
  cardButton: {
    backgroundColor: colors.lightMint,
    borderRadius: 14,
    marginTop: 16
  },
  cardButtonContent: {
    minHeight: 48,
    height: undefined
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginVertical: 0
  }
});
