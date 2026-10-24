import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Button, Card, Chip, IconButton, Text } from 'react-native-paper';
import { colors } from '../../theme/colors';

export default function HeroBanner() {
  return (
    <Card mode="contained" style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <Chip
          icon="creation"
          iconColor="#A7F3D0"
          compact
          textStyle={styles.heroBadgeText}
          style={styles.heroBadge}
        >
          AI chăm cây thông minh
        </Chip>

        <IconButton icon="camera-outline" iconColor="#FFFFFF" size={18} style={styles.heroCameraBtn} />
      </View>

      <View style={styles.heroBody}>
        <View style={styles.heroLeftCol}>
          <Text style={styles.heroTitle}>
            Để AI giúp bạn chăm{'\n'}cây tốt hơn
          </Text>
          <Text style={styles.heroSubtitle}>
            Chụp ảnh để nhận diện cây và phát hiện dấu hiệu bệnh chỉ trong vài giây.
          </Text>

          <Button
            mode="contained"
            icon="crop-free"
            buttonColor="#FFFFFF"
            textColor={colors.primary}
            compact
            contentStyle={styles.heroCtaContent}
            labelStyle={styles.heroCtaText}
            style={styles.heroCtaButton}
          >
            Quét cây ngay
          </Button>

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
    </Card>
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
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    height: 28,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
    marginVertical: 0,
  },
  heroCameraBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    margin: 0,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignSelf: 'flex-start',
    marginTop: 16,
    elevation: 3,
  },
  heroCtaContent: {
    height: 39,
    paddingHorizontal: 4,
  },
  heroCtaText: {
    color: colors.primary,
    fontSize: 13.5,
    fontWeight: '700',
    marginHorizontal: 2,
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
