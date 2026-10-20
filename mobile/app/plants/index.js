// app/plants/index.js - Trang danh mục cây (dung API thuc)
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Navbar from '../../src/components/home/Navbar';
import { colors } from '../../src/theme/colors';
import { usePlants, usePlantCategories } from '../../src/hooks/usePlants';

export default function PlantDirectoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCatId, setActiveCatId] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Fetch du lieu tu API
  const { categories } = usePlantCategories();
  const { plants, loading, error, total } = usePlants(activeCatId, search);

  // Debounce search: chi goi API khi nguoi dung dung go
  const handleSearchChange = (text) => {
    setInputValue(text);
    clearTimeout(handleSearchChange._timer);
    handleSearchChange._timer = setTimeout(() => setSearch(text), 500);
  };

  const handleClearSearch = () => {
    setInputValue('');
    setSearch('');
  };

  const renderCard = ({ item }) => {
    const catName =
      item.category_id?.category_name || '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() =>
          router.push({ pathname: '/plants/[id]', params: { id: item._id } })
        }
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.plant_image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {catName ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText} numberOfLines={1}>
                {catName}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.common_name}
          </Text>
          <Text style={styles.cardScientific} numberOfLines={1}>
            {item.scientific_name}
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons name="water-outline" size={12} color={colors.primaryLight} />
            <Text style={styles.cardWater} numberOfLines={1}>
              {item.care_requirements?.water || ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh mục cây</Text>
        <View style={styles.circleBtn}>
          <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textMuted}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên thường hoặc tên khoa học..."
          placeholderTextColor={colors.textMuted}
          value={inputValue}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {categories.map((cat) => {
            const isActive = activeCatId === cat._id;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveCatId(cat._id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat.category_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Result count */}
      <View style={styles.resultRow}>
        <Ionicons name="leaf-outline" size={14} color={colors.textMuted} />
        <Text style={styles.resultCount}>{total} loài cây</Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách cây...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.border} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        /* Grid 2 cột */
        <FlatList
          data={plants}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="leaf-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>Không tìm thấy cây nào</Text>
            </View>
          }
        />
      )}

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAF9' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Chips
  chipRow: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  chipContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Result row
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  resultCount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Grid
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    paddingTop: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Card
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#144D37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imageWrapper: {
    width: '100%',
    height: 148,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  // Badge goc tren ben PHAI
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(20,77,55,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '80%',
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardContent: { padding: 11 },
  cardName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  cardScientific: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  cardWater: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
    flex: 1,
  },

  // States
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 14,
    color: colors.statusError,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
