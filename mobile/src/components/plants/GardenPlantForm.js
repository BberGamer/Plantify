import PhotoUploadField from "../common/PhotoUploadField";
import { componentStyles } from "../../theme/componentStyles";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AcquisitionDatePicker from "./AcquisitionDatePicker";
import { colors, spacing, radius } from "../../theme";

export default function GardenPlantForm({ form }) {
  const field = (name, label, maxLength) => (
    <View key={name}>
      <TextInput
        mode="outlined"
        label={label}
        value={form.draft[name]}
        onChangeText={(value) => form.change(name, value)}
        disabled={form.busy}
        error={!!form.errors[name]}
        maxLength={maxLength}
      />
      {!!form.errors[name] && (
        <HelperText type="error">{form.errors[name]}</HelperText>
      )}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Button
            style={componentStyles.buttonShape}
            contentStyle={componentStyles.button}
            disabled={form.busy}
            onPress={form.cancel}
          >
            Hủy
          </Button>
          <Text variant="titleLarge">
            {form.editing ? "Sửa cây trong vườn" : "Thêm cây vào vườn"}
          </Text>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {form.loading ? (
            <ActivityIndicator accessibilityLabel="Đang tải thông tin cây" />
          ) : (
            <>
              {!!form.error && (
                <View accessibilityRole="alert">
                  <Text style={styles.error}>{form.error}</Text>
                  <Button
                    style={componentStyles.buttonShape}
                    contentStyle={componentStyles.button}
                    disabled={form.busy}
                    onPress={form.retry}
                  >
                    Tải lại thông tin
                  </Button>
                </View>
              )}
              <PhotoUploadField label="Ảnh cây" uri={form.image} disabled={form.busy}
                onChoose={form.choosePhoto} onRemove={form.canRemovePhoto ? form.removePhoto : undefined}
                chooseLabel="Chọn ảnh JPG / PNG" removeLabel={form.photo ? "Bỏ ảnh đã chọn" : "Bỏ ảnh hiện tại"}
                hint="Tối đa 10 MB · Không bắt buộc" />
              {field("plant_nickname", "Biệt danh cây *", 150)}
              {form.libraryPlant ? (
                <View style={styles.summary}>
                  <Text variant="titleMedium">
                    {form.editing
                      ? form.plant?.species_name
                      : form.plant?.common_name}
                  </Text>
                </View>
              ) : (
                field("custom_species_name", "Loài cây *", 200)
              )}
              {field("placement_location", "Vị trí đặt cây", 200)}
              {field("pot_type_size", "Loại / kích thước chậu", 200)}
              <AcquisitionDatePicker
                value={form.draft.acquisition_date}
                onChange={(value) => form.change("acquisition_date", value)}
                disabled={form.busy}
                error={form.errors.acquisition_date}
              />
              <Button
                style={componentStyles.buttonShape}
                contentStyle={componentStyles.button}
                mode="contained"
                loading={form.busy}
                disabled={
                  form.busy ||
                  ((form.libraryPlant || form.editing) && !form.plant)
                }
                onPress={form.save}
              >
                {form.editing ? "Lưu thay đổi" : "Lưu cây vào vườn"}
              </Button>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    padding: spacing.md,
  },
  content: {
    padding: 20,
    gap: spacing.md,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingBottom: 48,
  },
  photo: {
    alignItems: "center",
    gap: spacing.sm,
  },
  preview: {
    width: 180,
    height: 180,
    borderRadius: radius.card,
  },
  summary: {
    padding: spacing.md,
    backgroundColor: colors.lightMint,
    borderRadius: radius.md,
  },
  error: {
    color: colors.statusError,
  },
});
