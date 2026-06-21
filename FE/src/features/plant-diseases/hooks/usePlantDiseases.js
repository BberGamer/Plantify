// usePlantDiseases.js - React hooks cho Plant Diseases
import { useState, useEffect, useCallback } from "react";
import {
  getPlantDiseases,
  createPlantDisease,
  updatePlantDisease,
  deletePlantDisease
} from "../api";

export function usePlantDiseases({ page = 1, limit = 10, search, severity, plantId } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (severity && severity !== "all") params.severity = severity;
      if (plantId) params.plantId = plantId;
      const res = await getPlantDiseases(params);
      const result = res.result || res.data || res;
      setData(Array.isArray(result) ? result : result.diseases || []);
      if (result.total) setTotal(result.total);
      if (result.pages) setPages(result.pages);
    } catch (err) {
      console.error("Error fetching plant diseases:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, severity, plantId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { diseases: data, loading, total, pages, refetch: fetch };
}

export function useCreatePlantDisease() {
  const [loading, setLoading] = useState(false);

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await createPlantDisease(data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading };
}

export function useUpdatePlantDisease() {
  const [loading, setLoading] = useState(false);

  const update = async (id, data) => {
    setLoading(true);
    try {
      const res = await updatePlantDisease(id, data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}

export function useDeletePlantDisease() {
  const [loading, setLoading] = useState(false);

  const remove = async (id) => {
    setLoading(true);
    try {
      const res = await deletePlantDisease(id);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading };
}
