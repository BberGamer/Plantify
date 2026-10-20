// app/plants/[id].js - Trang chi tiet cay (dung API thuc)
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { usePlantDetail } from '../../src/hooks/usePlants';

// Bieu tuong cho tung yeu cau cham soc
const CARE_ICONS = {
  light: { icon: 'sunny-outline', label: 'Ánh sáng' },
  water: { icon: 'water-outline', label: 'Tưới nước' },
  temperature: { icon: 'thermometer-outline', label: 'Nhiệt độ' },
  humidity: { icon: 'partly-sunny-outline', label: 'Độ ẩm' },
  soil: { icon: 'earth-outline', label: 'Đất trồng' },
  fertilizer: { icon: 'leaf-outline', label: 'Phân bón' },
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const { plant, loading, error } = usePlantDetail(id);

  const handleAddToGarden = () => {
    Alert.alert(
      'Thêm vào vườn',
      `Bạn muốn thêm "${plant?.common_name}" vào vườn cây của mình?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm',
          onPress: () => Alert.alert('Thành công', 'Cây đã được thêm vào vườn!'),
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.floatingTitle}>Chi tiết cây</Text>
          <View style={styles.circleBtn} />
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin cây...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error / not found
  if (error || !plant) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.floatingTitle}>Chi tiết cây</Text>
          <View style={styles.circleBtn} />
        </View>
        <View style={styles.centerBox}>
          <Ionicons name="leaf-outline" size={56} color={colors.border} />
          <Text style={styles.errorText}>{error || 'Không tìm thấy cây này.'}</Text>
          <TouchableOpacity style={styles.backBtnOutline} onPress={() => router.back()}>
            <Text style={styles.backBtnOutlineText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categoryName = plant.category_id?.category_name || '';
  const careEntries = Object.entries(plant.care_requirements || {});

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.floatingTitle}>Chi tiết cây</Text>
        <TouchableOpacity
          style={[styles.circleBtn, saved && styles.circleBtnActive]}
          onPress={() => setSaved((v) => !v)}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={saved ? '#FFFFFF' : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Image */}
        <View style={styles.heroWrapper}>
          <Image
            source={{ uri: plant.plant_image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {categoryName ? (
            <View style={styles.heroCategoryChip}>
              <Ionicons name="pricetag-outline" size={12} color="#FFFFFF" />
              <Text style={styles.heroCategoryText}>{categoryName}</Text>
            </View>
          ) : null}
        </View>

        {/* Plant Identity */}
        <View style={styles.identityCard}>
          <Text style={styles.commonName}>{plant.common_name}</Text>
          <View style={styles.identityRow}>
            <View style={styles.identityMeta}>
              <Ionicons name="flask-outline" size={13} color={colors.textMuted} />
              <Text style={styles.identityMetaText} numberOfLines={1}>
                {plant.scientific_name}
              </Text>
            </View>
            {plant.botanical_family ? (
              <>
                <View style={styles.identityDivider} />
                <View style={styles.identityMeta}>
                  <Ionicons name="folder-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.identityMetaText}>{plant.botanical_family}</Text>
                </View>
              </>
            ) : null}
          </View>

          {/* Mo ta */}
          {plant.description ? (
            <>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.description}>{plant.description}</Text>
            </>
          ) : null}
        </View>

        {/* Yeu cau cham soc */}
        {careEntries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf" size={18} color={colors.primary} />
              <Text style={styles.sectionHeading}>Yêu cầu chăm sóc</Text>
            </View>
            <View style={styles.careGrid}>
              {careEntries.map(([key, value]) => {
                const meta = CARE_ICONS[key];
                if (!meta) return null;
                return (
                  <View key={key} style={styles.careItem}>
                    <View style={styles.careIconBox}>
                      <Ionicons name={meta.icon} size={22} color={colors.primary} />
                    </View>
                    <Text style={styles.careLabel}>{meta.label}</Text>
                    <Text style={styles.careValue} numberOfLines={2}>
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Benh thuong gap */}
        {plant.common_disease_ids?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit-outline" size={18} color={colors.statusWarning} />
              <Text style={styles.sectionHeading}>Bệnh thường gặp</Text>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>Xem bệnh</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primaryLight} />
              </TouchableOpacity>
            </View>
            <View style={styles.diseaseList}>
              {plant.common_disease_ids.map((diseaseId) => (
                <TouchableOpacity key={diseaseId.toString()} style={styles.diseaseItem} activeOpacity={0.75}>
                  <View style={styles.diseaseIconBox}>
                    <Ionicons name="bug-outline" size={16} color={colors.statusWarning} />
                  </View>
                  <Text style={styles.diseaseName}>{diseaseId.toString()}</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToGarden} activeOpacity={0.88}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Thêm vào vườn cây</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFCFA' },

  // States
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 14, color: colors.textMuted },
  errorText: {
    fontSize: 15,
    color: colors.statusError,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontWeight: '600',
  },
  backBtnOutline: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  backBtnOutlineText: { color: colors.primary, fontWeight: '700' },

  // Header
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softMintBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnActive: { backgroundColor: colors.primary },
  floatingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },

  scroll: { paddingBottom: 24 },

  // Hero
  heroWrapper: { width: '100%', height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroCategoryChip: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,77,55,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  heroCategoryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Identity card
  identityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: -20,
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: '#144D37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  commonName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  identityRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  identityMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  identityMetaText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', flex: 1 },
  identityDivider: { width: 1, height: 14, backgroundColor: colors.border },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#144D37',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeading: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { fontSize: 12, color: colors.primaryLight, fontWeight: '600' },

  // Care grid
  careGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  careItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: colors.softMintBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  careIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#144D37',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  careLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  careValue: {
    fontSize: 11.5,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Disease
  diseaseList: { gap: 8 },
  diseaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warmPeachBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  diseaseIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diseaseName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },

  // Meta info
  metaInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaInfoText: { fontSize: 12, color: colors.textMuted },
  metaInfoSep: { fontSize: 12, color: colors.border },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
