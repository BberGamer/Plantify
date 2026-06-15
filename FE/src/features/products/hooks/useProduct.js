// useProduct.js - Custom hook để fetch dữ liệu sản phẩm
import { useState, useEffect } from "react";
import { getProductById } from "../api";

/**
 * Hook lấy sản phẩm theo id.
 * @param {string} id - Product id
 * @param {number} [refreshKey=0] - Tang len de trigger re-fetch (dung sau khi submit rating)
 * @returns {{ product: object|null, loading: boolean, error: string|null }}
 */
export function useProduct(id, refreshKey = 0) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getProductById(id)
      .then((data) => {
        if (!cancelled) {
          setProduct(data.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  return { product, loading, error };
}
export default useProduct;
