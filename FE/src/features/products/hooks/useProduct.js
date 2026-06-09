// useProduct.js - Custom hook để fetch dữ liệu sản phẩm
import { useState, useEffect } from "react";
import { getProductById } from "../api";

/**
 * Hook lấy sản phẩm theo id
 * @param {string} id
 * @returns {{ product: object|null, loading: boolean, error: string|null }}
 */
export function useProduct(id) {
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
  }, [id]);

  return { product, loading, error };
}
export default useProduct;
