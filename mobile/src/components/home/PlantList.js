import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';

const PLANTS = [
  {
    id: '1',
    name: 'Trầu bà',
    status: 'Khỏe mạnh',
    statusColor: '#22C55E',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Hoa hồng',
    status: 'Cần kiểm tra lá',
    statusColor: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Cà chua',
    status: 'Đang theo dõi...',
    statusColor: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500&auto=format&fit=crop&q=80',
  },
];

export default function PlantList() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cây của bạn</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.linkText}>Tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {PLANTS.map((plant) => (
          <Card key={plant.id} mode="contained" style={styles.card}>
            <View style={styles.imageWrapper}>
              <Card.Cover source={{ uri: plant.image }} style={styles.image} resizeMode="cover" />
              <View style={[styles.statusDot, { backgroundColor: plant.statusColor }]} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantStatus} numberOfLines={1}>
                {plant.status}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#183B2B',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#247855',
  },
  scrollList: {
    paddingRight: 8,
  },
  card: {
    width: 148,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#EBF0EC',
    overflow: 'hidden',
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardContent: {
    padding: 12,
  },
  plantName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#183B2B',
  },
  plantStatus: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 3,
  },
});
