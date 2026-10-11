import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeader from '../../src/components/home/HomeHeader';
import HeroBanner from '../../src/components/home/HeroBanner';
import FeatureGrid from '../../src/components/home/FeatureGrid';
import GardenSummary from '../../src/components/home/GardenSummary';
import TodayTasks from '../../src/components/home/TodayTasks';
import WeatherCard from '../../src/components/home/WeatherCard';
import PlantList from '../../src/components/home/PlantList';
import DailyTip from '../../src/components/home/DailyTip';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <HeroBanner />
        <FeatureGrid />
        <GardenSummary />
        <TodayTasks />
        <WeatherCard />
        <PlantList />
        <DailyTip />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFCFA',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
});
