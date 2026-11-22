import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

function DiseaseImage({ uri, style, onPress }) {
  if (!uri) {
    return (
      <View style={[style, styles.imageFallback]}>
        <Ionicons name="bug-outline" size={28} color={colors.statusWarning} />
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : undefined} accessibilityLabel={onPress ? "Phóng to ảnh bệnh" : undefined}>
      <Image source={{ uri }} style={style} resizeMode="cover" />
    </Pressable>
  );
}

export default function PlantDiseases({ diseases, loading, error, onRetry }) {
  const [expanded, setExpanded] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="medkit-outline" size={19} color={colors.statusWarning} />
        <Text style={styles.heading}>Bệnh thường gặp</Text>
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.body}>Đang tải bệnh thường gặp…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error} accessibilityRole="alert">{error}</Text>
          <Button onPress={onRetry}>Thử lại</Button>
        </View>
      ) : diseases.length === 0 ? (
        <Text style={styles.empty}>Chưa có thông tin bệnh thường gặp cho cây này.</Text>
      ) : (
        <View style={styles.list}>
          {diseases.map((disease) => {
            const open = expanded === disease._id;
            return (
              <View key={disease._id} style={[styles.item, open && styles.itemOpen]}>
                <View style={styles.itemHeader}>
                  <DiseaseImage
                    uri={disease.disease_image_url}
                    style={styles.thumbnail}
                    onPress={disease.disease_image_url ? () => setZoomedImage(disease.disease_image_url) : undefined}
                  />
                  <Pressable
                    style={styles.headerToggle}
                    onPress={() => setExpanded(open ? null : disease._id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={`${disease.disease_name}. ${open ? "Thu gọn" : "Mở chi tiết"}`}
                  >
                    <View style={styles.nameBox}>
                      <Text style={styles.name}>{disease.disease_name}</Text>
                      {!!disease.scientific_name && (
                        <Text style={styles.scientific} numberOfLines={1}>{disease.scientific_name}</Text>
                      )}
                    </View>
                    <Ionicons name={open ? "chevron-up" : "chevron-down"} size={22} color={colors.textMuted} />
                  </Pressable>
                </View>
                {open && (
                  <View style={styles.detail}>
                    {!!disease.disease_image_url && (
                      <>
                        <DiseaseImage
                          uri={disease.disease_image_url}
                          style={styles.expandedImage}
                          onPress={() => setZoomedImage(disease.disease_image_url)}
                        />
                        <Text style={styles.imageHint}>Chạm vào ảnh để phóng to</Text>
                      </>
                    )}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Triệu chứng</Text>
                      <Text style={styles.body}>{disease.typical_symptoms}</Text>
                    </View>
                    {!!disease.environmental_cause && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Nguyên nhân môi trường</Text>
                        <Text style={styles.body}>{disease.environmental_cause}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      <Modal visible={Boolean(zoomedImage)} transparent animationType="fade" onRequestClose={() => setZoomedImage(null)}>
        <View style={styles.modal}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setZoomedImage(null)} accessibilityLabel="Đóng ảnh phóng to" />
          {!!zoomedImage && <Image source={{ uri: zoomedImage }} style={styles.zoomedImage} resizeMode="contain" />}
          <Pressable style={styles.closeButton} onPress={() => setZoomedImage(null)} accessibilityRole="button" accessibilityLabel="Đóng ảnh phóng to">
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 14, marginTop: 18, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 },
  heading: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  loading: { gap: 10, alignItems: "center", paddingVertical: 18, backgroundColor: colors.white, borderRadius: 18 },
  errorBox: { backgroundColor: colors.white, borderRadius: 18, padding: 16 },
  list: { gap: 12 },
  item: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.borderLight, overflow: "hidden", elevation: 2, shadowColor: "#144D37", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  itemOpen: { borderColor: "#F0D8B5" },
  itemHeader: { minHeight: 82, flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  headerToggle: { flex: 1, minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10 },
  thumbnail: { width: 58, height: 58, borderRadius: 14, backgroundColor: colors.warmPeachBg },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  nameBox: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  scientific: { fontSize: 12, fontStyle: "italic", color: colors.textMuted },
  detail: { borderTopWidth: 1, borderTopColor: colors.borderLight, padding: 14, gap: 14 },
  expandedImage: { width: "100%", height: 220, borderRadius: 14, backgroundColor: colors.warmPeachBg },
  imageHint: { marginTop: -8, fontSize: 11, textAlign: "center", color: colors.textMuted },
  detailSection: { gap: 5 },
  detailLabel: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4, color: colors.statusWarning },
  body: { fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  empty: { fontSize: 14, lineHeight: 22, color: colors.textSecondary, backgroundColor: colors.white, borderRadius: 18, padding: 16 },
  error: { color: colors.statusError, lineHeight: 22 },
  modal: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: 18 },
  zoomedImage: { width: "100%", height: "80%" },
  closeButton: { position: "absolute", top: 48, right: 22, width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
});
