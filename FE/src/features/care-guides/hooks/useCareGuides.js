// useCareGuides.js - React hooks cho Care Guides
import { useState, useEffect, useCallback } from "react";
import {
  getCareGuides,
  createCareGuide,
  updateCareGuide,
  deleteCareGuide
} from "../api";

export function useCareGuides({ page = 1, limit = 10, plantId } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (plantId) params.plantId = plantId;
      const res = await getCareGuides(params);
      const result = res.result || res.data || res;
      setData(Array.isArray(result) ? result : result.careGuides || []);
      setTotal(result.total ?? (Array.isArray(result) ? result.length : 0));
      setPages(result.pages ?? 1);
    } catch (err) {
      console.error("Error fetching care guides:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, plantId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { careGuides: data, loading, total, pages, refetch: fetch };
}

export function useCreateCareGuide() {
  const [loading, setLoading] = useState(false);

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await createCareGuide(data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading };
}

export function useUpdateCareGuide() {
  const [loading, setLoading] = useState(false);

  const update = async (id, data) => {
    setLoading(true);
    try {
      const res = await updateCareGuide(id, data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}

export function useDeleteCareGuide() {
  const [loading, setLoading] = useState(false);

  const remove = async (id) => {
    setLoading(true);
    try {
      const res = await deleteCareGuide(id);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading };
}
