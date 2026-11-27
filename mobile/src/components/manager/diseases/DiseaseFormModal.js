import CatalogAiPicker from "../CatalogAiPicker";
import { FormModalFrame } from "../../common/ModalFrames";
import CatalogImageFields from "../CatalogImageFields";
import { componentStyles } from "../../../theme/componentStyles";

import {
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
  ai,
  visible,
  editing,
  form,
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
  onTogglePlant,
  onRetryPlants,
  onRetryDetail,
}) {
  const locked = saving || choosingPhoto || loading || !ready;
  const close = () => {
    if (!saving && !choosingPhoto) onClose();
  };
  return (
    <FormModalFrame visible={visible} onRequestClose={close}>
          <View style={styles.header}>
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={close} disabled={saving || choosingPhoto}>
              Hủy
            </Button>
            <Text variant="titleMedium">
              {editing ? "Sửa bệnh cây" : "Thêm bệnh cây"}
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
            {loading && (
              <ActivityIndicator accessibilityLabel="Đang tải chi tiết bệnh" />
            )}
            {!ready && !loading && (
              <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onRetryDetail}>Thử tải lại chi tiết</Button>
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
            <CatalogImageFields
              images={form.images}
              disabled={locked}
              onChange={(images) => onChange("images", images)}
              onChoosePhoto={onChoosePhoto}
            />
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
            <CatalogAiPicker ai={ai} disabled={locked} plantIds={form.plant_ids} />
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
    </FormModalFrame>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 0
  },
  photo: {
    borderRadius: 16,
    width: "100%",
    height: 180,
    backgroundColor: colors.background
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    flexWrap: "wrap"
  },
  form: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 24,
    gap: 14,
    paddingBottom: spacing.xxxl
  },
  error: {
    color: colors.statusError
  }
});
