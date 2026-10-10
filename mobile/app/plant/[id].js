import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/Header';
import CustomButton from '../../src/components/CustomButton';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import { plantService } from '../../src/services/plantService';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { formatCurrency } from '../../src/utils/formatters';
import { theme } from '../../src/theme';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const fetchPlant = async () => {
    try {
      const data = await plantService.getPlantById(id);
      setPlant(data);
    } catch (e) {
      // Fallback
      setPlant({
        _id: id,
        name: 'Monstera Deliciosa',
        category: 'Indoor',
        price: 45,
        description: 'The Monstera Deliciosa is a popular houseplant that is known for its large, glossy, fenestrated leaves. It is relatively easy to care for and can grow quite large indoors.',
        images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        care: {
          light: 'Indirect sunlight',
          water: 'Once a week',
          difficulty: 'Easy'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(plant, quantity);
    Alert.alert('Added to Cart', `${plant.name} has been added to your cart.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => router.push('/cart') }
    ]);
  };

  if (loading) return <LoadingSpinner />;
  if (!plant) return <View style={styles.error}><Text>Plant not found</Text></View>;

  const fav = isFavorite(plant._id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showBack
        rightIcon={fav ? "heart" : "heart-outline"}
        onRightPress={() => toggleFavorite(plant)}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: plant.images?.[0] }} style={styles.image} resizeMode="cover" />
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.name}>{plant.name}</Text>
              <Text style={styles.category}>{plant.category}</Text>
            </View>
            <Text style={styles.price}>{formatCurrency(plant.price)}</Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Ionicons name="sunny-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.tagText}>{plant.care?.light || 'Medium light'}</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="water-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.tagText}>{plant.care?.water || 'Weekly'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{plant.description}</Text>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Add to Cart"
          onPress={handleAddToCart}
          style={styles.addToCartBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 100 },
  image: { width: '100%', height: 350 },
  content: { padding: theme.spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...theme.typography.h2, color: theme.colors.text },
  category: { ...theme.typography.body1, color: theme.colors.textSecondary, marginTop: 4 },
  price: { ...theme.typography.h2, color: theme.colors.primary },
  tagsRow: { flexDirection: 'row', marginTop: theme.spacing.lg, gap: theme.spacing.md },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.light, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { ...theme.typography.caption, color: theme.colors.text, marginLeft: 4 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginTop: theme.spacing.xl, marginBottom: theme.spacing.sm },
  description: { ...theme.typography.body1, color: theme.colors.textSecondary, lineHeight: 24 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.xl },
  quantityLabel: { ...theme.typography.subtitle, color: theme.colors.text },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { backgroundColor: theme.colors.light, padding: 8, borderRadius: 8 },
  qtyValue: { ...theme.typography.h3, marginHorizontal: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.card, padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border },
  addToCartBtn: { width: '100%' },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
