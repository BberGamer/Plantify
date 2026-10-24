// PlantFormModal.js - Giao diện PlantFormModal của màn hình quản lý cây.
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";
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
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView
          style={styles.modalSafe}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editing ? "Cập nhật cây" : "Thêm cây mới"}
            </Text>
            <TouchableOpacity onPress={onSave} disabled={saving}>
              <Text style={[styles.saveText, saving && styles.disabled]}>
                {saving ? "Đang lưu…" : "Lưu"}
              </Text>
            </TouchableOpacity>
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
              ["plant_image", "Đường dẫn hình ảnh"],
              ["description", "Mô tả"],
            ].map(([key, label]) => {
              const multiline = key === "description";
              return (
                <View key={key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    value={form[key]}
                    onChangeText={(value) => onFieldChange(key, value)}
                    editable={!saving}
                    accessibilityLabel={label}
                    placeholder={label.replace(" *", "")}
                    placeholderTextColor={colors.textMuted}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    autoCapitalize="none"
                    style={[styles.input, multiline && styles.multilineInput]}
                  />
                </View>
              );
            })}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  cancelText: { color: colors.textSecondary, fontSize: 14 },
  saveText: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  form: { padding: 19, paddingBottom: 45 },
  field: { marginBottom: 15 },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 44,
    textAlignVertical: "top",
  },
  multilineInput: { minHeight: 78 },
  categoryScroll: { flexGrow: 0, marginBottom: 19 },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 8,
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
    marginTop: 4,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  publishHint: { color: colors.textSecondary, fontSize: 11, marginTop: -3 },
  disabled: { opacity: 0.5 },
  error: { color: colors.statusError, marginBottom: 12 },
});
