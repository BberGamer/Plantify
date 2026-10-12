import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quét cây</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  text: { fontSize: 18, color: '#183B2B', fontWeight: 'bold' },
});
