import ImageWithFallback from "../../common/ImageWithFallback";
import { radius } from "../../../theme";

import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

const PATHOGEN_LABELS = {
  fungus: "Nấm",
  bacteria: "Vi khuẩn",
  virus: "Virus",
  pest: "Sâu hại",
  nematode: "Tuyến trùng",
  physiological: "Sinh lý",
  other: "Khác",
};

export default function DiseaseCard({ item, disabled, onEdit, onDelete }) {
  const active = item.status === "active";
  const hasActions =
    typeof onEdit === "function" && typeof onDelete === "function";
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <ImageWithFallback uri={item.disease_image_url} style={styles.imageWrap}
          accessibilityLabel={`Ảnh ${item.disease_name}`} placeholderIcon="bug-outline" placeholderLabel="Ảnh bệnh chưa khả dụng" />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.disease_name}
            </Text>
            <View
              style={[styles.status, active ? styles.active : styles.inactive]}
            >
              <View
                style={[
                  styles.statusDot,
                  active ? styles.activeDot : styles.inactiveDot,
                ]}
              />
              <Text style={[styles.statusText, !active && styles.inactiveText]}>
                {active ? "Đang dùng" : "Tạm ẩn"}
              </Text>
            </View>
          </View>
          {!!item.scientific_name && (
            <Text style={styles.scientificName} numberOfLines={1}>
              {item.scientific_name}
            </Text>
          )}
          <View style={styles.pathogenRow}>
            <Ionicons
              name="flask-outline"
              size={13}
              color={colors.textSecondary}
            />
            <Text style={styles.pathogen}>
              {PATHOGEN_LABELS[item.pathogen_type] || "Khác"}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.symptoms} numberOfLines={2}>
        {item.typical_symptoms}
      </Text>
      {hasActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(item)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Sửa ${item.disease_name}`}
          >
            <Ionicons name="create-outline" size={19} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Xóa ${item.disease_name}`}
          >
            <Ionicons
              name="trash-outline"
              size={19}
              color={colors.statusError}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 16
  },
  cardTop: {
    flexWrap: "wrap",
    gap: 8,
    flexDirection: "row",
    alignItems: "flex-start"
  },
  imageWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.warmPeachBg,
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  info: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  name: {
    lineHeight: 24,
    flex: 1,
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800"
  },
  scientificName: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 2
  },
  pathogenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5
  },
  pathogen: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  active: {
    backgroundColor: colors.lightMint
  },
  inactive: {
    backgroundColor: colors.borderLight
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3
  },
  activeDot: {
    backgroundColor: colors.statusSuccess
  },
  inactiveDot: {
    backgroundColor: colors.textMuted
  },
  statusText: {
    color: colors.primaryLight,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800"
  },
  inactiveText: {
    color: colors.textSecondary
  },
  symptoms: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
    marginTop: 11
  },
  editButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmPeachBg,
    borderRadius: radius.input
  }
});
