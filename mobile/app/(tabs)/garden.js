import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../src/components/navigation/Navbar';
import { colors } from '../../src/theme/colors';

const PLANTS = [
  { id: '1', name: 'Trầu bà phòng khách', category: 'Cây lá', location: 'Phòng khách', status: 'healthy', icon: 'leaf-outline', task: 'Tưới nước sau 2 ngày' },
  { id: '2', name: 'Hồng ban công', category: 'Cây hoa', location: 'Ban công', status: 'treatment', icon: 'flower-outline', task: 'Phun thuốc nấm sinh học hôm nay' },
  { id: '3', name: 'Lưỡi hổ phòng ngủ', category: 'Lọc không khí', location: 'Phòng ngủ', status: 'healthy', icon: 'trail-sign-outline', task: 'Xoay chậu sau 4 ngày' },
  { id: '4', name: 'Sen đá bàn làm việc', category: 'Cây mọng nước', location: 'Bàn làm việc', status: 'healthy', icon: 'rose-outline', task: 'Tưới nước sau 5 ngày' },
];
const FILTERS = [{ id: 'all', label: 'Tất cả' }, { id: 'healthy', label: 'Khỏe mạnh' }, { id: 'treatment', label: 'Đang điều trị' }];

function UnavailableButton({ label, icon, style, accessibilityLabel }) {
  return (
    <Pressable disabled accessibilityRole="button" accessibilityLabel={accessibilityLabel || label} accessibilityHint="Chưa khả dụng" accessibilityState={{ disabled: true }} style={[styles.unavailableButton, style]}>
      {icon && <Ionicons name={icon} size={17} color={colors.textSecondary} />}
      {label && <Text style={styles.buttonLabel}>{label}</Text>}
    </Pressable>
  );
}

function GardenCard({ plant }) {
  const treating = plant.status === 'treatment';
  const actions = treating ? ['Lộ trình điều trị', 'Lịch sử sức khỏe'] : ['Lịch chăm sóc', 'Sửa thông tin', 'Lưu trữ'];
  return (
    <View style={styles.card}>
      <View style={styles.plantRow}>
        <View style={[styles.thumbnail, treating && styles.treatmentThumbnail]}>
          <View style={styles.iconCircle}><Ionicons name={plant.icon} size={32} color={treating ? '#B77928' : colors.primaryLight} /></View>
        </View>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.metadata}>{plant.category} · {plant.location}</Text>
          <View style={[styles.badge, treating && styles.treatmentBadge]}>
            <View style={[styles.statusDot, treating && styles.treatmentDot]} />
            <Text style={[styles.badgeText, treating && styles.treatmentText]}>{treating ? 'Đang điều trị · Ngày 4/14' : 'Khỏe mạnh'}</Text>
          </View>
          <Text style={styles.task}><Text style={styles.taskPrefix}>{treating ? 'Tiếp theo: ' : 'Lịch chăm sóc: '}</Text>{plant.task}</Text>
        </View>
      </View>
      <View style={styles.actions}>{actions.map(label => <UnavailableButton key={label} label={label} style={styles.cardAction} />)}</View>
    </View>
  );
}

export default function GardenScreen() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const visiblePlants = PLANTS.filter(plant => (filter === 'all' || plant.status === filter) && plant.name.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <UnavailableButton icon="menu-outline" accessibilityLabel="Menu" style={styles.menu} />
        <Text accessibilityRole="header" style={styles.title}>Vườn cây của tôi</Text>
        <UnavailableButton label="Thêm" icon="add-outline" />
      </View>
      <View style={styles.controls}>
        <View style={styles.filters}>{FILTERS.map(item => (
          <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: filter === item.id }} onPress={() => setFilter(item.id)} style={[styles.filter, filter === item.id && styles.selectedFilter]}>
            <Text style={[styles.filterLabel, filter === item.id && styles.selectedFilterLabel]}>{item.label}</Text>
          </Pressable>
        ))}</View>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput accessibilityLabel="Tìm cây trong vườn" placeholder="Tìm cây trong vườn của bạn..." placeholderTextColor={colors.textMuted} value={query} onChangeText={setQuery} style={styles.input} returnKeyType="search" />
          {query.length > 0 && <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm" hitSlop={8} style={styles.clear}><Ionicons name="close-circle" size={20} color={colors.textSecondary} /></Pressable>}
        </View>
        <View style={styles.countRow}><Text accessibilityLiveRegion="polite" style={styles.count}>Tổng: <Text style={styles.countNumber}>{visiblePlants.length} cây</Text> trong vườn</Text><Ionicons name="list-outline" size={18} color={colors.textMuted} /></View>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {visiblePlants.map(plant => <GardenCard key={plant.id} plant={plant} />)}
        {visiblePlants.length === 0 && <View style={styles.empty}><Ionicons name="leaf-outline" size={44} color={colors.primaryLight} /><Text style={styles.emptyTitle}>Không tìm thấy cây</Text><Text style={styles.emptyText}>Thử tên khác hoặc chọn bộ lọc khác để tìm cây trong vườn.</Text></View>}
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { flex: 1, fontSize: 19, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  menu: { width: 44, paddingHorizontal: 0 },
  unavailableButton: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  buttonLabel: { fontSize: 12, lineHeight: 18, color: colors.textSecondary, textAlign: 'center' },
  controls: { paddingHorizontal: 18, paddingTop: 16, backgroundColor: '#FAFCFA' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filter: { minHeight: 44, justifyContent: 'center', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  selectedFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  selectedFilterLabel: { color: colors.white },
  search: { flexDirection: 'row', alignItems: 'center', minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 12, gap: 8, backgroundColor: colors.white },
  input: { flex: 1, minWidth: 0, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
  clear: { minWidth: 32, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  count: { fontSize: 12, color: colors.textSecondary },
  countNumber: { fontWeight: '700', color: colors.primary },
  list: { flex: 1, backgroundColor: '#FAFCFA' },
  listContent: { paddingHorizontal: 18, paddingBottom: 24, gap: 14 },
  card: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 14 },
  plantRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  thumbnail: { width: 72, height: 88, borderRadius: 16, backgroundColor: colors.lightMint, alignItems: 'center', justifyContent: 'center' },
  treatmentThumbnail: { backgroundColor: colors.warmPeachBg },
  iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  plantInfo: { flex: 1, minWidth: 0, gap: 7 },
  plantName: { fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.textPrimary },
  metadata: { fontSize: 11, lineHeight: 17, color: colors.textSecondary },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.lightMint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, maxWidth: '100%' },
  treatmentBadge: { backgroundColor: colors.warmPeachBg },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primaryLight },
  treatmentDot: { backgroundColor: '#B77928' },
  badgeText: { flexShrink: 1, fontSize: 10, lineHeight: 15, fontWeight: '700', color: colors.primaryLight },
  treatmentText: { color: '#946017' },
  task: { fontSize: 11, lineHeight: 18, color: colors.textPrimary },
  taskPrefix: { color: colors.textSecondary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  cardAction: { flexGrow: 1, flexBasis: 80, paddingHorizontal: 8 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptyText: { fontSize: 14, lineHeight: 22, textAlign: 'center', color: colors.textSecondary },
});
