// usePlantDiseases.js - Quản lý danh sách và thao tác dữ liệu bệnh cây
import { useState, useEffect, useCallback } from "react";
import {
  getPlantDiseases,
  createPlantDisease,
  updatePlantDisease,
  deletePlantDisease
} from "../api";

/**
 * Tải danh sách bệnh cây theo phân trang, cây liên quan và từ khóa.
 * @param {Object} [options={}] - Query danh sách bệnh.
 * @param {number} [options.page=1] - Trang hiện tại.
 * @param {number} [options.limit=10] - Số phần tử mỗi trang.
 * @param {string} [options.search] - Từ khóa tìm kiếm.
 * @param {string} [options.severity] - Mức độ nghiêm trọng.
 * @param {string} [options.affectedPlantId] - ID cây bị ảnh hưởng.
 * @returns {Object} Danh sách, phân trang, trạng thái tải và refetch.
 */
export function usePlantDiseases({
  page = 1,
  limit = 10,
  search,
  severity,
  affectedPlantId,
} = {}) {
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
      if (affectedPlantId) params.affectedPlantId = affectedPlantId;
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
  }, [page, limit, search, severity, affectedPlantId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { diseases: data, loading, total, pages, refetch: fetch };
}

/** Quản lý thao tác tạo bệnh cây. @returns {Object} Hàm create và trạng thái loading. */
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

/** Quản lý thao tác cập nhật bệnh cây. @returns {Object} Hàm update và trạng thái loading. */
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

/** Quản lý thao tác xóa bệnh cây. @returns {Object} Hàm remove và trạng thái loading. */
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
