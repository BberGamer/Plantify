// trang homepage

import { StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityIndicator, Button, Text, Card } from "react-native-paper";
import useHomeGarden from "../../src/hooks/useHomeGarden";
import useCareTasks from "../../src/hooks/useCareTasks";
import { gardenToday } from "../../src/utils/gardenDate";

import HomeHeader from "../../src/components/home/HomeHeader";
import FeatureGrid from "../../src/components/home/FeatureGrid";
import GardenSummary from "../../src/components/home/GardenSummary";
import TodayTasks from "../../src/components/home/TodayTasks";
import WeatherCard from "../../src/components/home/WeatherCard";
import PlantList from "../../src/components/home/PlantList";
import Navbar from "../../src/components/navigation/Navbar";

export default function HomeScreen() {
  const garden = useHomeGarden();
  const care = useCareTasks(gardenToday());
  const refresh = () => Promise.all([garden.reload(), care.reload()]);
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        refreshControl={<RefreshControl refreshing={garden.loading || care.loading} onRefresh={refresh} />}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <WeatherCard />
        <FeatureGrid />
        {garden.loading ? <ActivityIndicator style={{ marginTop: 24 }} accessibilityLabel="Đang tải vườn cây" /> : garden.error ? (
          <Card style={{ marginTop: 24 }}><Card.Content>
            <Text accessibilityRole="alert">{garden.error}</Text>
            <Button onPress={garden.reload}>Thử lại dữ liệu vườn</Button>
          </Card.Content></Card>
        ) : garden.data && <GardenSummary summary={garden.data} />}
        <TodayTasks care={care} />
        {!garden.loading && !garden.error && garden.data && <PlantList plants={garden.data.plants} />}
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFCFA",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
});
