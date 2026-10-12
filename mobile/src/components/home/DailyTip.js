import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Text } from 'react-native-paper';

export default function DailyTip() {
  return (
    <Card mode="contained" style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="bulb-outline" size={26} color="#EAB308" />
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>Mẹo chăm cây hôm nay</Text>
        <Text style={styles.title}>Đất ẩm chưa cần tưới thêm</Text>
        <Text style={styles.desc}>
          Tránh tưới quá nhiều nước khi đất vẫn còn ẩm. Nhu cầu nước phụ thuộc vào từng loại cây và điều kiện môi trường.
        </Text>
        <Button mode="text" compact textColor="#247855" labelStyle={styles.linkText} style={styles.linkRow}>
          Đọc hướng dẫn ›
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#EAF5EE',
    borderRadius: 22,
    padding: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  category: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#247855',
  },
  title: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#183B2B',
    marginTop: 4,
  },
  desc: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 6,
  },
  linkRow: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#247855',
    marginHorizontal: 0,
    marginVertical: 0,
  },
});
