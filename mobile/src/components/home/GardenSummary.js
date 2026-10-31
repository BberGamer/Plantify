import React from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, ProgressBar, Text } from 'react-native-paper';

export default function GardenSummary() {
  const router = useRouter();
  const openGarden = () => router.navigate('/customer/garden');
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Vườn cây của bạn</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={openGarden} accessibilityRole="button">
          <Text style={styles.linkText}>Xem vườn</Text>
        </TouchableOpacity>
      </View>

      <Card mode="contained" style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Tổng số cây</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: '#16A34A' }]}>9</Text>
            <Text style={styles.statLabel}>Khỏe mạnh</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>3</Text>
            <Text style={styles.statLabel}>Cần chăm sóc</Text>
          </View>
        </View>

        <View style={styles.healthSection}>
          <View style={styles.healthLabelRow}>
            <Text style={styles.healthTitle}>Sức khỏe tổng quan</Text>
            <Text style={styles.healthValue}>75% tốt</Text>
          </View>
          <ProgressBar progress={0.75} color="#2E8B57" style={styles.progressTrack} />
        </View>

        <Button
          onPress={openGarden}
          mode="contained"
          buttonColor="#EAF5EE"
          textColor="#1A5B40"
          contentStyle={styles.cardButtonContent}
          labelStyle={styles.buttonText}
          style={styles.cardButton}
        >
          Xem vườn của tôi
        </Button>
      </Card>
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
    fontSize: 19,
    fontWeight: '800',
    color: '#183B2B',
  },
  linkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#247855',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBF0EC',
    padding: 16,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#183B2B',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#EBF0EC',
  },
  healthSection: {
    marginTop: 18,
  },
  healthLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTitle: {
    fontSize: 13,
    color: '#374151',
  },
  healthValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5ECE1',
    overflow: 'hidden',
  },
  cardButton: {
    backgroundColor: '#EAF5EE',
    borderRadius: 14,
    marginTop: 16,
  },
  cardButtonContent: {
    height: 45,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A5B40',
    marginVertical: 0,
  },
});
