import { spacing } from "../../../theme/tokens";
// PlantFormModal.js - Giao diện PlantFormModal của màn hình quản lý cây.

import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";
import FormField from "../../common/FormField";
import { SafeAreaView } from "react-native-safe-area-context";
import PlantCareFields from "./PlantCareFields";
import { colors } from "../../../theme/colors";

export default function PlantFormModal({
  visible,
  editing,
  form,
  categories,
  categoriesLoading,
  categoriesError,
  saving,
  error,
  onClose,
  onSave,
  onFieldChange,
  onCareChange,
  onRetryCategories,
  photo,
  onChoosePhoto,
  onRemovePhoto,
}) {
  const close = () => { if (!saving) onClose(); };
  const imageUri = photo?.uri || form.plant_image || null;
  const hasImage = typeof imageUri === "string" && imageUri.trim().length > 0;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView
          style={styles.modalSafe}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalHeader}>
            <Button onPress={close} disabled={saving}>Hủy</Button>
            <Text style={styles.modalTitle}>
              {editing ? "Cập nhật cây" : "Thêm cây mới"}
            </Text>
            <Button onPress={onSave} disabled={saving} loading={saving}>Lưu</Button>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            {!!error && (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            )}
            <Text style={styles.fieldLabel}>Danh mục *</Text>
            {categoriesLoading && (
              <Text style={styles.fieldLabel}>Đang tải danh mục…</Text>
            )}
            {!!categoriesError && (
              <View>
                <Text style={styles.error} accessibilityRole="alert">
                  {categoriesError}
                </Text>
                <Button
                  onPress={onRetryCategories}
                  disabled={saving || categoriesLoading}
                  textColor={colors.primary}
                >
                  Thử lại danh mục
                </Button>
              </View>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.categoryChip,
                    form.category_id === category._id &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => onFieldChange("category_id", category._id)}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      form.category_id === category._id &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {category.category_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {!categoriesLoading && !categoriesError && !categories.length && (
              <Text style={styles.noCategories}>
                Vui lòng tạo danh mục cây trước khi thêm cây mới.
              </Text>
            )}
            {[
              ["common_name", "Tên thường gọi *"],
              ["scientific_name", "Tên khoa học *"],
              ["botanical_family", "Họ thực vật"],
              ["description", "Mô tả"],
            ].map(([key, label]) => {
              const multiline = key === "description";
              return (
                <View key={key}>
                  <FormField
                    label={label}
                    value={form[key]}
                    onChangeText={(value) => onFieldChange(key, value)}
                    disabled={saving}
                    accessibilityLabel={label}
                    placeholder={label.replace(" *", "")}
                    placeholderTextColor={colors.textMuted}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    autoCapitalize="none"
                    contentStyle={multiline && styles.multilineInput}
                  />
                </View>
              );
            })}
            <View style={styles.photoSection}>
              <Text style={styles.fieldLabel}>Hình ảnh cây</Text>
              {hasImage ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.photoPreview}
                  accessibilityLabel="Ảnh cây đã chọn"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoHint}>Chưa có hình ảnh cây</Text>
                </View>
              )}
              <Button
                mode="outlined"
                icon="image-plus"
                disabled={saving}
                onPress={onChoosePhoto}
              >
                {hasImage ? "Chọn ảnh khác từ máy" : "Tải ảnh từ máy"}
              </Button>
              <Text style={styles.photoHint}>JPG / PNG · Tối đa 10 MB · Ảnh được tải lên khi lưu cây</Text>
              {hasImage ? (
                <Button disabled={saving} onPress={onRemovePhoto}>
                  {photo ? "Bỏ ảnh đã chọn" : "Xóa ảnh hiện tại"}
                </Button>
              ) : null}
            </View>
            <PlantCareFields
              value={form.care_requirements}
              disabled={saving}
              onChange={onCareChange}
            />
            <View style={styles.publishRow}>
              <View>
                <Text style={styles.fieldLabel}>Hiển thị công khai</Text>
                <Text style={styles.publishHint}>
                  Cho phép cây xuất hiện trong danh mục công khai
                </Text>
              </View>
              <Switch
                value={!!form.is_published}
                onValueChange={(value) => onFieldChange("is_published", value)}
                disabled={saving}
                accessibilityLabel="Hiển thị công khai"
                trackColor={{ true: colors.primaryLight }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  form: { padding: 19, paddingBottom: 45 },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },
  multilineInput: { minHeight: 78 },
  photoSection: { gap: 10, marginBottom: 22 },
  photoPreview: { width: "100%", height: 200, borderRadius: 16, backgroundColor: colors.lightMint, resizeMode: "contain" },
  photoPlaceholder: { height: 110, borderWidth: 1, borderStyle: "dashed", borderColor: colors.inputBorder, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: colors.white },
  photoHint: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  categoryScroll: { flexGrow: 0, marginBottom: 19 },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: { color: colors.textSecondary, fontSize: 12 },
  categoryChipTextActive: { color: colors.white, fontWeight: "700" },
  noCategories: {
    color: colors.statusError,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 18,
  },
  publishRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  publishHint: { color: colors.textSecondary, fontSize: 11, marginTop: -3 },
  error: { color: colors.statusError, marginBottom: spacing.md },
});
