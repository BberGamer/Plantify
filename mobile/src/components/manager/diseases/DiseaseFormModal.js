import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  RadioButton,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../theme/colors";
import DiseasePlantPicker from "./DiseasePlantPicker";

const PATHOGENS = [
  ["fungus", "Nấm"],
  ["bacteria", "Vi khuẩn"],
  ["virus", "Virus"],
  ["pest", "Sâu hại"],
  ["nematode", "Tuyến trùng"],
  ["physiological", "Sinh lý"],
  ["other", "Khác"],
];
const FIELDS = [
  ["disease_name", "Tên bệnh *", 150],
  ["scientific_name", "Tên khoa học", 200],
  ["typical_symptoms", "Triệu chứng điển hình *", 5000, true],
  ["environmental_cause", "Nguyên nhân môi trường", 5000, true],
  ["disease_image_url", "URL ảnh bệnh (http/https)", 2048],
];

export default function DiseaseFormModal({
  visible,
  editing,
  form,
  loading,
  ready,
  saving,
  error,
  plants,
  plantsLoading,
  plantsError,
  onClose,
  onSave,
  onChange,
  onTogglePlant,
  onRetryPlants,
  onRetryDetail,
}) {
  const locked = saving || loading || !ready;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <Button onPress={onClose} disabled={saving}>
              Hủy
            </Button>
            <Text variant="titleMedium">
              {editing ? "Sửa bệnh cây" : "Thêm bệnh cây"}
            </Text>
            <Button onPress={onSave} disabled={locked} loading={saving}>
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
            {loading && (
              <ActivityIndicator accessibilityLabel="Đang tải chi tiết bệnh" />
            )}
            {!ready && !loading && (
              <Button onPress={onRetryDetail}>Thử tải lại chi tiết</Button>
            )}
            {FIELDS.map(([key, label, maxLength, multiline]) => (
              <TextInput
                key={key}
                mode="outlined"
                label={label}
                value={form[key]}
                onChangeText={(value) => onChange(key, value)}
                disabled={locked}
                maxLength={maxLength}
                multiline={Boolean(multiline)}
                autoCapitalize={
                  key === "disease_image_url" ? "none" : "sentences"
                }
                autoCorrect={key !== "disease_image_url"}
                keyboardType={key === "disease_image_url" ? "url" : "default"}
              />
            ))}
            <Text variant="titleMedium">Tác nhân gây bệnh</Text>
            <RadioButton.Group
              value={form.pathogen_type}
              onValueChange={(value) => onChange("pathogen_type", value)}
            >
              {PATHOGENS.map(([value, label]) => (
                <RadioButton.Item
                  key={value}
                  value={value}
                  label={label}
                  disabled={locked}
                />
              ))}
            </RadioButton.Group>
            <View style={styles.header}>
              <Text>
                {form.status === "active" ? "Đang dùng (công khai)" : "Tạm ẩn"}
              </Text>
              <Switch
                accessibilityLabel="Công khai bệnh cây"
                value={form.status === "active"}
                onValueChange={(value) =>
                  onChange("status", value ? "active" : "inactive")
                }
                disabled={locked}
              />
            </View>
            <DiseasePlantPicker
              key={`${visible}-${editing?._id || "new"}`}
              plants={plants}
              selected={form.plant_ids}
              loading={plantsLoading}
              error={plantsError}
              disabled={locked}
              onToggle={onTogglePlant}
              onRetry={onRetryPlants}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    flexWrap: "wrap",
  },
  form: { padding: 18, gap: 14, paddingBottom: 32 },
  error: { color: colors.statusError },
});
