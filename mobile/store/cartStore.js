import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  
  addToCart: (plant, quantity = 1) => {
    const { items } = get();
    const existingItem = items.find(item => item._id === plant._id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item._id === plant._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      });
    } else {
      set({ items: [...items, { ...plant, quantity }] });
    }
  },
  
  removeFromCart: (plantId) => {
    set({ items: get().items.filter(item => item._id !== plantId) });
  },
  
  updateQuantity: (plantId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(plantId);
      return;
    }
    set({
      items: get().items.map(item =>
        item._id === plantId ? { ...item, quantity } : item
      )
    });
  },
  
  clearCart: () => set({ items: [] }),
  
  totalAmount: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
