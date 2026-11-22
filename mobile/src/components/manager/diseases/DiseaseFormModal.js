import { useState } from "react";
import {
  Image,
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
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/tokens";
import FormField from "../../common/FormField";
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
];

export default function DiseaseFormModal({
  visible,
  editing,
  form,
  photo,
  choosingPhoto,
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
  onChoosePhoto,
  onRemovePhoto,
  onTogglePlant,
  onRetryPlants,
  onRetryDetail,
}) {
  const locked = saving || choosingPhoto || loading || !ready;
  const imageUri = photo?.uri || form.disease_image_url;
  const [failedImageUri, setFailedImageUri] = useState(null);
  const close = () => {
    if (!saving && !choosingPhoto) onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <Button onPress={close} disabled={saving || choosingPhoto}>
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
              <FormField
                key={key}
                containerStyle={styles.field}
                mode="outlined"
                label={label}
                value={form[key]}
                onChangeText={(value) => onChange(key, value)}
                disabled={locked}
                maxLength={maxLength}
                multiline={Boolean(multiline)}
              />
            ))}
            <Text variant="titleMedium">Ảnh bệnh</Text>
            {!!imageUri && (failedImageUri === imageUri ? (
              <Text variant="bodySmall">Không tải được ảnh xem trước.</Text>
            ) : (
              <Image
                source={{ uri: imageUri }}
                style={styles.photo}
                resizeMode="contain"
                accessibilityLabel="Ảnh bệnh cây"
                onError={() => setFailedImageUri(imageUri)}
              />
            ))}
            <Button
              mode="outlined"
              onPress={onChoosePhoto}
              disabled={locked}
              loading={choosingPhoto}
            >
              {imageUri ? "Chọn ảnh khác từ máy" : "Tải ảnh từ máy"}
            </Button>
            <Text variant="bodySmall">
              JPG hoặc PNG, tối đa 10 MB. Ảnh được tải lên khi lưu.
            </Text>
            {!!imageUri && (
              <Button onPress={onRemovePhoto} disabled={locked}>
                {photo ? "Bỏ ảnh đã chọn" : "Xóa ảnh hiện tại"}
              </Button>
            )}
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
  field: { marginBottom: 0 },
  photo: { width: "100%", height: 180, backgroundColor: colors.background },
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    flexWrap: "wrap",
  },
  form: { padding: 18, gap: 14, paddingBottom: spacing.xxxl },
  error: { color: colors.statusError },
});
