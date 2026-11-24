import SearchField from "../../common/SearchField";
import { componentStyles } from "../../../theme/componentStyles";
import React, { useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Text,
} from "react-native-paper";

export default function DiseasePlantPicker({
  plants,
  selected,
  loading,
  error,
  disabled,
  onToggle,
  onRetry,
}) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase("vi");
  const filtered = plants.filter((plant) =>
    `${plant.common_name} ${plant.scientific_name || ""}`
      .toLocaleLowerCase("vi")
      .includes(query),
  );
  return (
    <View>
      <Text variant="titleMedium">
        Cây liên quan * ({selected.length} đã chọn)
      </Text>
      <SearchField
        placeholder="Tìm cây theo tên…" accessibilityLabel="Tìm cây liên quan theo tên"
        value={search}
        onChangeText={setSearch}
        disabled={disabled}
      />
      {loading && <ActivityIndicator accessibilityLabel="Đang tải cây" />}
      {!!error && (
        <View>
          <Text accessibilityRole="alert">{error}</Text>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onRetry} disabled={disabled || loading}>
            Thử tải lại cây
          </Button>
        </View>
      )}
      {!loading && !error && filtered.length === 0 && (
        <Text>Không tìm thấy cây phù hợp.</Text>
      )}
      {filtered.map((plant) => (
        <Checkbox.Item
          key={plant._id}
          label={`${plant.common_name}${plant.is_published === false ? " (chưa công bố)" : ""}`}
          status={selected.includes(plant._id) ? "checked" : "unchecked"}
          onPress={() => onToggle(plant._id)}
          disabled={disabled}
        />
      ))}
    </View>
  );
}
