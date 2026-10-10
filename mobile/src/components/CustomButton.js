import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

const CustomButton = ({ title, onPress, style, textStyle, variant = 'primary', disabled, loading }) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.accent;
    if (variant === 'outline') return 'transparent';
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    if (variant === 'outline') return theme.colors.primary;
    return theme.colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    ...theme.typography.subtitle,
    fontWeight: 'bold',
  },
});

export default CustomButton;
