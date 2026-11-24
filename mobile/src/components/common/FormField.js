import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import { colors } from "../../theme/colors";
import { control, radius, spacing, typography } from "../../theme/tokens";

// Ghép input với lỗi/hướng dẫn: caller giữ draft, focus và validation nghiệp vụ.
export default React.forwardRef(function FormField(
  {
    error,
    hint,
    disabled = false,
    style,
    contentStyle,
    containerStyle,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.group, containerStyle]}>
      <TextInput
        ref={ref}
        mode="outlined"
        {...props}
        disabled={disabled}
        editable={!disabled && props.editable !== false}
        error={Boolean(error)}
        accessibilityLabel={props.accessibilityLabel || props.label}
        style={[styles.input, style, focused && styles.focused]}
        outlineColor={colors.inputBorder}
        activeOutlineColor={colors.primary}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        contentStyle={[styles.content, contentStyle]}
        outlineStyle={styles.outline}
      />
      {!!(error || hint) && (
        <HelperText
          type={error ? "error" : "info"}
          visible
          accessibilityRole={error ? "alert" : undefined}
        >
          {error || hint}
        </HelperText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    marginBottom: spacing.lg
  },
  input: {
    backgroundColor: colors.white
  },
  content: {
    ...typography.body,
    minHeight: control.minHeight
  },
  outline: {
    borderRadius: radius.input
  },
  focused: Platform.select({
    web: {
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineColor: colors.primary,
      outlineOffset: 3
    },
    default: {}
  })
});
