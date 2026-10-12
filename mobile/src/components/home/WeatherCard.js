import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from 'react-native-paper';

export default function WeatherCard() {
  return (
    <Card mode="contained" style={styles.card}>
      <View style={styles.topRow}>
        <Ionicons name="partly-sunny-outline" size={32} color="#183B2B" />
        <View style={styles.tempCol}>
          <Text style={styles.temp}>29°C</Text>
          <Text style={styles.status}>Có mây</Text>
        </View>
      </View>

      <View style={styles.advicePill}>
        <Ionicons name="leaf-outline" size={18} color="#247855" style={{ marginRight: 8 }} />
        <Text style={styles.adviceText}>
          Hãy kiểm tra độ ẩm đất trước khi tưới cây hôm nay.
        </Text>
      </View>

      <Text style={styles.note}>Dữ liệu minh họa trong bản mẫu</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAF5EE',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempCol: {
    marginLeft: 12,
  },
  temp: {
    fontSize: 24,
    fontWeight: '800',
    color: '#183B2B',
  },
  status: {
    fontSize: 12.5,
    color: '#4B7B63',
    marginTop: 1,
  },
  advicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  adviceText: {
    fontSize: 12.5,
    color: '#183B2B',
    flex: 1,
  },
  note: {
    fontSize: 11,
    color: '#8AA596',
    textAlign: 'right',
    marginTop: 8,
  },
});
