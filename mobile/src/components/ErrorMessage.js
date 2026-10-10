import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: '#F8D7DA',
    borderRadius: 8,
    marginVertical: theme.spacing.sm,
  },
  text: {
    color: theme.colors.error,
    ...theme.typography.body2,
    textAlign: 'center',
  },
});

export default ErrorMessage;
