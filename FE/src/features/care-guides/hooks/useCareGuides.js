// useCareGuides.js - Quản lý danh sách và thao tác dữ liệu hướng dẫn chăm sóc
import { useState, useEffect, useCallback } from "react";
import {
  getCareGuides,
  createCareGuide,
  updateCareGuide,
  deleteCareGuide
} from "../api";

/**
 * Tải danh sách hướng dẫn chăm sóc theo phân trang và bộ lọc.
 * @param {Object} [options={}] - Query danh sách.
 * @param {number} [options.page=1] - Trang hiện tại.
 * @param {number} [options.limit=10] - Số phần tử mỗi trang.
 * @param {string} [options.plantId] - ID cây cần lọc.
 * @param {string} [options.search] - Từ khóa tìm kiếm.
 * @returns {Object} Danh sách, phân trang, trạng thái tải và refetch.
 */
export function useCareGuides({ page = 1, limit = 10, plantId, search } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (plantId) params.plantId = plantId;
      if (search) params.search = search;
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
  }, [page, limit, plantId, search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { careGuides: data, loading, total, pages, refetch: fetch };
}

/** Quản lý thao tác tạo hướng dẫn chăm sóc. @returns {Object} Hàm create và trạng thái loading. */
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

/** Quản lý thao tác cập nhật hướng dẫn chăm sóc. @returns {Object} Hàm update và trạng thái loading. */
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

/** Quản lý thao tác xóa hướng dẫn chăm sóc. @returns {Object} Hàm remove và trạng thái loading. */
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
