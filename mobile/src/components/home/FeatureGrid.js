import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    id: '1',
    title: 'Nhận diện cây',
    subtitle: 'Biết tên cây tức thì',
    bgColor: '#EEF8F1',
    icon: <Ionicons name="leaf-outline" size={20} color="#247855" />,
  },
  {
    id: '2',
    title: 'Chẩn đoán bệnh',
    subtitle: 'Kiểm tra dấu hiệu lạ',
    bgColor: '#FFF8EE',
    icon: <FontAwesome5 name="stethoscope" size={17} color="#C26D2B" />,
  },
  {
    id: '3',
    title: 'Vườn của tôi',
    subtitle: 'Quản lý 12 cây',
    bgColor: '#F4FBF7',
    icon: <MaterialCommunityIcons name="sprout-outline" size={20} color="#247855" />,
  },
  {
    id: '4',
    title: 'Trợ lý AI',
    subtitle: 'Hỏi đáp chăm cây',
    bgColor: '#F6F4FC',
    icon: <MaterialCommunityIcons name="robot-happy-outline" size={20} color="#7C3AED" />,
  },
];

export default function FeatureGrid() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Khám phá Plantify</Text>
      <View style={styles.grid}>
        {FEATURES.map((item) => (
          <Card
            key={item.id}
            mode="contained"
            style={[styles.card, { backgroundColor: item.bgColor }]}
          >
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>{item.icon}</View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#183B2B',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 36 - 12) / 2,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#183B2B',
    marginTop: 14,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
});
