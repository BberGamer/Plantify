import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDiseases({ diseases, loading, error, onRetry }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Ionicons name="medkit-outline" size={18} color={colors.statusWarning} />
        <Text style={styles.heading}>Bệnh thường gặp</Text>
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.body}>Đang tải bệnh thường gặp…</Text>
        </View>
      ) : error ? (
        <View>
          <Text style={styles.error} accessibilityRole="alert">{error}</Text>
          <Button onPress={onRetry}>Thử lại</Button>
        </View>
      ) : diseases.length === 0 ? (
        <Text style={styles.body}>Chưa có thông tin bệnh thường gặp cho cây này.</Text>
      ) : (
        <View style={styles.list}>
          {diseases.map((disease) => (
            <View key={disease._id} style={styles.item}>
              <View style={styles.header}>
                <Ionicons name="bug-outline" size={18} color={colors.statusWarning} />
                <Text style={styles.name}>{disease.disease_name}</Text>
              </View>
              {!!disease.scientific_name && <Text style={styles.scientific}>{disease.scientific_name}</Text>}
              <Text style={styles.body}>Triệu chứng: {disease.typical_symptoms}</Text>
              {!!disease.environmental_cause && <Text style={styles.body}>Nguyên nhân môi trường: {disease.environmental_cause}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.white, marginHorizontal: 14, marginTop: 14, borderRadius: 20, padding: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  heading: { flex: 1, fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  loading: { gap: 10, alignItems: "center", paddingVertical: 12 },
  list: { gap: 10 },
  item: { backgroundColor: colors.warmPeachBg, borderRadius: 14, padding: 14, gap: 6 },
  name: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  body: { fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  scientific: { fontStyle: "italic", color: colors.textSecondary },
  error: { color: colors.statusError, lineHeight: 22 },
});
