import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function HeroBanner() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={13} color="#A7F3D0" />
          <Text style={styles.heroBadgeText}>AI chăm cây thông minh</Text>
        </View>

        <TouchableOpacity style={styles.heroCameraBtn} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.heroBody}>
        <View style={styles.heroLeftCol}>
          <Text style={styles.heroTitle}>
            Để AI giúp bạn chăm{'\n'}cây tốt hơn
          </Text>
          <Text style={styles.heroSubtitle}>
            Chụp ảnh để nhận diện cây và phát hiện dấu hiệu bệnh chỉ trong vài giây.
          </Text>

          <TouchableOpacity style={styles.heroCtaButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="crop-free" size={18} color={colors.primary} />
            <Text style={styles.heroCtaText}>Quét cây ngay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroLink} activeOpacity={0.7}>
            <Text style={styles.heroLinkText}>Tìm hiểu cách chăm cây ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroRightCol}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 18,
    marginTop: 12,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
    marginLeft: 5,
  },
  heroCameraBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  heroLeftCol: {
    width: '64%',
    paddingRight: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
    marginTop: 8,
  },
  heroCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    alignSelf: 'flex-start',
    marginTop: 16,
    elevation: 3,
  },
  heroCtaText: {
    color: colors.primary,
    fontSize: 13.5,
    fontWeight: '700',
    marginLeft: 6,
  },
  heroLink: {
    marginTop: 12,
  },
  heroLinkText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  heroRightCol: {
    width: '36%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 110,
    height: 150,
    borderRadius: 16,
  },
});
