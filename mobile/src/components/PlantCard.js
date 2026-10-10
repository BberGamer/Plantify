import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { formatCurrency } from '../utils/formatters';
import { useFavoritesStore } from '../../store/favoritesStore';

const PlantCard = ({ plant, style }) => {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const fav = isFavorite(plant._id);

  const handlePress = () => {
    router.push(`/plant/${plant._id}`);
  };

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: plant.images?.[0] || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(plant)}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={20}
            color={fav ? theme.colors.error : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{plant.name}</Text>
        <Text style={styles.category}>{plant.category}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{formatCurrency(plant.price)}</Text>
          <View style={styles.addButton}>
            <Ionicons name="add" size={20} color={theme.colors.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    width: 160,
    marginRight: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.light,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 6,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    padding: theme.spacing.sm,
  },
  name: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    marginBottom: 4,
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...theme.typography.body1,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 4,
  },
});

export default PlantCard;
