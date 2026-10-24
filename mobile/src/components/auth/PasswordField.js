// PasswordField.js - Trường mật khẩu dùng chung; hiện/ẩn là state giao diện.
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  hint,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.group}>
      <Text style={[styles.label, disabled && styles.muted]}>{label}</Text>
      <View style={[styles.wrapper, disabled && styles.disabled]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setVisible((previous) => !previous)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          style={styles.eye}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    height: 50,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  eye: { padding: 6 },
  disabled: { backgroundColor: colors.background },
  muted: { color: colors.textMuted },
  hint: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
});
