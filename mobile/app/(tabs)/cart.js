import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/Header';
import CustomButton from '../../src/components/CustomButton';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../src/utils/formatters';
import { theme } from '../../src/theme';

export default function CartScreen() {
  const { items, updateQuantity, removeFromCart, totalAmount } = useCartStore();
  const total = totalAmount();
  const shipping = total > 0 ? 10 : 0;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={theme.colors.border} />
      <Text style={styles.emptyText}>Your cart is empty</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Cart" />
      
      <FlatList
        data={items}
        keyExtractor={item => item._id}
        contentContainerStyle={items.length === 0 ? styles.flex1 : styles.list}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item._id, item.quantity - 1)} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item._id, item.quantity + 1)} style={styles.qtyBtn}>
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item._id)}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Subtotal</Text>
            <Text style={styles.summaryText}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Shipping</Text>
            <Text style={styles.summaryText}>{formatCurrency(shipping)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>{formatCurrency(total + shipping)}</Text>
          </View>
          
          <CustomButton title="Proceed to Checkout" onPress={() => {}} style={styles.checkoutBtn} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex1: { flex: 1 },
  list: { padding: theme.spacing.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...theme.typography.h2, color: theme.colors.textSecondary, marginTop: theme.spacing.lg },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: theme.spacing.md },
  itemName: { ...theme.typography.subtitle, color: theme.colors.text },
  itemPrice: { ...theme.typography.body1, color: theme.colors.primary, fontWeight: 'bold', marginVertical: 4 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  qtyBtn: { backgroundColor: theme.colors.light, padding: 4, borderRadius: 4 },
  qtyText: { marginHorizontal: 12, ...theme.typography.body1, fontWeight: 'bold' },
  deleteBtn: { padding: 8 },
  summaryContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  summaryText: { ...theme.typography.body1, color: theme.colors.textSecondary },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm },
  totalText: { ...theme.typography.h3, color: theme.colors.text },
  checkoutBtn: { marginTop: theme.spacing.md },
});
