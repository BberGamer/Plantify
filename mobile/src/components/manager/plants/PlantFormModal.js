import CatalogAiPicker from "../CatalogAiPicker";
import { FormModalFrame } from "../../common/ModalFrames";
import PhotoUploadField from "../../common/PhotoUploadField";
import { componentStyles } from "../../../theme/componentStyles";
import { radius } from "../../../theme";
import { spacing } from "../../../theme/tokens";
// PlantFormModal.js - Giao diện PlantFormModal của màn hình quản lý cây.

import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";
import FormField from "../../common/FormField";

import PlantCareFields from "./PlantCareFields";
import { colors } from "../../../theme/colors";

export default function PlantFormModal({
  ai,
  loading,
  ready,
  onRetryDetail,
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
  const locked = saving || loading || !ready;
  const close = () => {
    if (!saving) onClose();
  };
  const imageUri = photo?.uri || form.plant_image || null;
  const hasImage = typeof imageUri === "string" && imageUri.trim().length > 0;
  return (
    <FormModalFrame visible={visible} onRequestClose={close}>
          <View style={styles.modalHeader}>
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={close} disabled={saving}>
              Hủy
            </Button>
            <Text style={styles.modalTitle}>
              {editing ? "Cập nhật cây" : "Thêm cây mới"}
            </Text>
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onSave} disabled={locked || !ai.ready} loading={saving}>
              Lưu
            </Button>
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
            {loading && <Text>Đang tải thông tin cây…</Text>}
            {!loading && !ready && <Button onPress={onRetryDetail}>Thử tải lại chi tiết cây</Button>}
            <Text style={styles.fieldLabel}>Danh mục *</Text>
            {categoriesLoading && (
              <Text style={styles.fieldLabel}>Đang tải danh mục…</Text>
            )}
            {!!categoriesError && (
              <View>
                <Text style={styles.error} accessibilityRole="alert">
                  {categoriesError}
                </Text>
                <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
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
                  disabled={locked}
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
                    disabled={locked}
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
            <CatalogAiPicker ai={ai} disabled={locked} />
            <PhotoUploadField label="Hình ảnh cây" uri={hasImage ? imageUri : null} disabled={locked}
              onChoose={onChoosePhoto} onRemove={hasImage ? onRemovePhoto : undefined}
              chooseLabel={hasImage ? "Chọn ảnh khác từ máy" : "Tải ảnh từ máy"}
              removeLabel={photo ? "Bỏ ảnh đã chọn" : "Xóa ảnh hiện tại"}
              hint="JPG / PNG · Tối đa 10 MB · Ảnh được tải lên khi lưu cây" />
            <PlantCareFields
              value={form.care_requirements}
              disabled={locked}
              onChange={onCareChange}
            />
            <View style={styles.publishRow}>
              <View style={styles.publishCopy}>
                <Text style={styles.fieldLabel}>Hiển thị công khai</Text>
                <Text style={styles.publishHint}>
                  Cho phép cây xuất hiện trong danh mục công khai
                </Text>
              </View>
              <Switch
                value={!!form.is_published}
                onValueChange={(value) => onFieldChange("is_published", value)}
                disabled={locked}
                accessibilityLabel="Hiển thị công khai"
                trackColor={{ true: colors.primaryLight }}
              />
            </View>
          </ScrollView>
    </FormModalFrame>
  );
}

const styles = StyleSheet.create({
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background
  },
  modalHeader: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 8,
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800"
  },
  form: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 45
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    marginBottom: 7
  },
  multilineInput: {
    minHeight: 78
  },
  photoSection: {
    gap: 10,
    marginBottom: 22
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.lightMint,
    resizeMode: "contain"
  },
  photoPlaceholder: {
    height: 110,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.inputBorder,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white
  },
  photoHint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 19
  },
  categoryChip: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: 13,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.white
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  },
  categoryChipTextActive: {
    color: colors.white,
    fontWeight: "700"
  },
  noCategories: {
    color: colors.statusError,
    fontSize: 13,
    lineHeight: 20,
    marginTop: -12,
    marginBottom: 18
  },
  publishRow: {
    gap: 16,
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  publishHint: {
    maxWidth: 480,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: -3
  },
  error: {
    color: colors.statusError,
    marginBottom: spacing.md
  },
  publishCopy: {
    flex: 1,
    minWidth: 160
  }
});
