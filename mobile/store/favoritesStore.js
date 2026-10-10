import { create } from 'zustand';

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  
  toggleFavorite: (plant) => {
    const { favorites } = get();
    const isFav = favorites.some(f => f._id === plant._id);
    
    if (isFav) {
      set({ favorites: favorites.filter(f => f._id !== plant._id) });
    } else {
      set({ favorites: [...favorites, plant] });
    }
  },
  
  isFavorite: (plantId) => {
    return get().favorites.some(f => f._id === plantId);
  }
}));
