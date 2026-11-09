// usePlantDetailScreen.js - Điều phối dữ liệu và các hành động màn chi tiết cây.
import { useRouter } from "expo-router";
import { usePlantDetail } from "./usePlants";
import useScreenScope from "./useScreenScope";
import useFavoriteActions from "./useFavoriteActions";

export default function usePlantDetailScreen(id) {
  const detail = usePlantDetail(id);
  const router = useRouter();
  const { isActive } = useScreenScope(undefined, undefined, id);
  const favorite = useFavoriteActions(detail.plant ? [detail.plant] : []);
  const plantId = detail.plant?._id;
  const addToGarden = () => {
    if (!detail.plant || !isActive()) return;
    router.push({ pathname: "/customer/garden/add", params: { plantId: detail.plant._id } });
  };
  return {
    ...detail,
    saved: favorite.favorites[plantId] === true,
    showFavorite: favorite.enabled,
    favoriteBusy: !!favorite.pending[plantId] || favorite.favorites[plantId] === undefined,
    favoriteError: favorite.error,
    retryFavorite: favorite.retry,
    toggleSaved: () => favorite.toggle(plantId),
    addToGarden,
  };
}
