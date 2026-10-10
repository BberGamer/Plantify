import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../src/components/Header';
import SearchBar from '../../src/components/SearchBar';
import CategoryFilter from '../../src/components/CategoryFilter';
import PlantCard from '../../src/components/PlantCard';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import { plantService } from '../../src/services/plantService';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(['All', 'Indoor', 'Outdoor', 'Succulents']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlants = async () => {
    try {
      const data = await plantService.getPlants();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants', error);
      // Fallback dummy data for display
      setPlants([
        { _id: '1', name: 'Monstera Deliciosa', category: 'Indoor', price: 45, images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'] },
        { _id: '2', name: 'Ficus Lyrata', category: 'Indoor', price: 55, images: ['https://images.unsplash.com/photo-1620127807580-5a3d078b6680?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'] },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlants();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Plant Lover'}!</Text>
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search for plants..."
        />
        
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Plants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {plants.map(plant => (
              <PlantCard key={plant._id} plant={plant} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Updates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {plants.slice().reverse().map(plant => (
              <PlantCard key={plant._id} plant={plant} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  greeting: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: 4,
  },
  section: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.lg,
  },
});
