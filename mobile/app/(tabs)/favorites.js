import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../src/components/Header';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../src/utils/formatters';
import { theme } from '../../src/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { addToCart } = useCartStore();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={theme.colors.border} />
      <Text style={styles.emptyText}>No favorites yet</Text>
      <Text style={styles.emptySubtext}>Save your favorite plants here to easily find them later.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Favorites" />
      <FlatList
        data={favorites}
        keyExtractor={item => item._id}
        contentContainerStyle={favorites.length === 0 ? styles.flex1 : styles.list}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemCard} onPress={() => router.push(`/plant/${item._id}`)}>
            <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => toggleFavorite(item)}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.addBtn]} onPress={() => addToCart(item, 1)}>
                <Ionicons name="cart-outline" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex1: {
    flex: 1,
  },
  list: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.h2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  itemName: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  itemPrice: {
    ...theme.typography.body1,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.light,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
  }
});
