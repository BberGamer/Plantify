import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/Header';
import SearchBar from '../../src/components/SearchBar';
import PlantCard from '../../src/components/PlantCard';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import { plantService } from '../../src/services/plantService';
import { theme } from '../../src/theme';

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const data = await plantService.getPlants();
      setPlants(data);
    } catch (e) {
      setPlants([
        { _id: '1', name: 'Monstera', category: 'Indoor', price: 45, images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'] },
        { _id: '2', name: 'Ficus', category: 'Indoor', price: 55, images: ['https://images.unsplash.com/photo-1620127807580-5a3d078b6680?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'] },
        { _id: '3', name: 'Snake Plant', category: 'Indoor', price: 35, images: ['https://images.unsplash.com/photo-1593482892290-f54927eba704?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'] },
        { _id: '4', name: 'Pothos', category: 'Indoor', price: 25, images: ['https://images.unsplash.com/photo-1585011002856-65bf686de6d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = plants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Explore" />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Find your perfect plant..."
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <PlantCard plant={item} style={styles.card} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  card: {
    width: '48%',
    marginRight: 0,
    marginBottom: 0,
  }
});
