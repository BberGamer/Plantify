// useMyGarden.js - Quản lý danh sách và các thao tác CRUD My Garden
import { useCallback, useEffect, useState } from "react";
import {
  createUserPlant,
  deleteUserPlant,
  getMyGarden,
  getUserPlantById,
  updateUserPlant,
} from "../api";
import { getApiErrorMessage } from "../myGarden.utils";

/**
 * Quản lý danh sách My Garden cùng thao tác tạo, cập nhật, xóa và upload ảnh.
 * @returns {Object} State danh sách, trạng thái request và các action My Garden.
 */
export function useMyGarden() {
  const [userPlants, setUserPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((currentKey) => currentKey + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadMyGarden() {
      setLoading(true);
      setError("");
      try {
        const response = await getMyGarden(controller.signal);
        if (!cancelled) setUserPlants(response.data || []);
      } catch (requestError) {
        if (!cancelled && requestError.code !== "ERR_CANCELED") {
          setError(getApiErrorMessage(
            requestError,
            "Không thể tải danh sách My Garden."
          ));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMyGarden();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshKey]);

  const create = useCallback(async (payload) => {
    setSaving(true);
    try {
      const response = await createUserPlant(payload);
      setUserPlants((currentPlants) => [response.data, ...currentPlants]);
      return response.data;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(async (userPlantId, payload) => {
    setSaving(true);
    try {
      const response = await updateUserPlant(userPlantId, payload);
      setUserPlants((currentPlants) => currentPlants.map((userPlant) => (
        userPlant._id === userPlantId ? response.data : userPlant
      )));
      return response.data;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (userPlantId) => {
    setDeletingId(userPlantId);
    try {
      await deleteUserPlant(userPlantId);
      setUserPlants((currentPlants) => currentPlants.filter(
        (userPlant) => userPlant._id !== userPlantId
      ));
    } finally {
      setDeletingId("");
    }
  }, []);

  const replaceUserPlant = useCallback((updatedPlant) => {
    setUserPlants((currentPlants) => currentPlants.map((userPlant) => (
      userPlant._id === updatedPlant._id
        ? {
          ...userPlant,
          ...updatedPlant,
          catalogPlantId: updatedPlant.catalogPlantId?.name
            ? updatedPlant.catalogPlantId
            : userPlant.catalogPlantId,
        }
        : userPlant
    )));
  }, []);

  return {
    userPlants,
    loading,
    saving,
    deletingId,
    error,
    refetch,
    create,
    update,
    remove,
    replaceUserPlant,
  };
}

/**
 * Tải chi tiết một cây khi có ID và hook được bật.
 * @param {string} userPlantId - ID cây người dùng.
 * @param {boolean} enabled - Có cho phép thực hiện request hay không.
 * @returns {Object} Chi tiết cây, trạng thái tải, lỗi và hàm refetch.
 */
export function useUserPlantDetail(userPlantId, enabled) {
  const [userPlant, setUserPlant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((currentKey) => currentKey + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !userPlantId) {
      setUserPlant(null);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      setError("");
      setUserPlant(null);
      try {
        const response = await getUserPlantById(
          userPlantId,
          controller.signal
        );
        if (!cancelled) setUserPlant(response.data || null);
      } catch (requestError) {
        if (!cancelled && requestError.code !== "ERR_CANCELED") {
          setError(getApiErrorMessage(
            requestError,
            "Không thể tải chi tiết cây."
          ));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, refreshKey, userPlantId]);

  return { userPlant, loading, error, refetch };
}
