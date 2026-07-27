// useCartMutations.js - Quản lý trạng thái các thao tác thay đổi giỏ hàng
import { useCallback, useState } from "react";
import { addCartItem, mergeCart } from "@/features/cart/api";
import {
  clearLocalCart,
  notifyCartUpdated,
  readLocalCart,
  writeLocalCart,
} from "@/features/cart/cartStorage";

/** Điều phối thêm/cập nhật/xóa cart item cho cả backend và localStorage. @returns {Object} Các mutation giỏ hàng. */
export function useCartMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItem = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await addCartItem(payload);
      notifyCartUpdated();
      return result;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeLocalCart = useCallback(async () => {
    const localCart = readLocalCart();
    if (localCart.length === 0) {
      notifyCartUpdated();
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await mergeCart(localCart);
      clearLocalCart();
      return result;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async ({
    product,
    quantity = 1,
    isAuthenticated,
    limitWhenStockMissing = false,
  }) => {
    if (isAuthenticated) {
      await addItem({
        productId: product._id,
        quantity,
        selected: true,
      });
      return { status: "added" };
    }

    const cart = readLocalCart();
    const existingItemIndex = cart.findIndex((item) => item.id === product._id);
    const stock = product.stock || 0;

    if (existingItemIndex > -1) {
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      if (
        newQuantity > stock
        && (limitWhenStockMissing || stock > 0)
      ) {
        cart[existingItemIndex].quantity = stock;
        writeLocalCart(cart);
        return { status: "limited", stock: product.stock };
      }

      cart[existingItemIndex].quantity = newQuantity;
      writeLocalCart(cart);
      return { status: "updated" };
    }

    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity,
      stock,
      image:
        product.thumbnail
        || product.images?.[0]
        || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      shop: product.brand || "Plantify Shop",
      selected: true,
    });
    writeLocalCart(cart);
    return { status: "added" };
  }, [addItem]);

  return {
    addProduct,
    addItem,
    mergeLocalCart,
    loading,
    error,
  };
}
