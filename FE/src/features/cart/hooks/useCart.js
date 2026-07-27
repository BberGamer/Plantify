import { useEffect, useState } from "react";
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/features/cart/api";
import {
  extractCartPayload,
  normalizeCartItems,
  notifyCartUpdated,
  readLocalCart,
  writeLocalCart,
} from "@/features/cart/cartStorage";

export function useCart({ authLoading, isAuthenticated }) {
  const [cartItems, setCartItems] = useState(() => readLocalCart());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setCartItems(readLocalCart());
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    getCart()
      .then((response) => {
        if (!cancelled) setCartItems(extractCartPayload(response).items);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  const persistItems = async (nextItems, requests) => {
    setCartItems(nextItems);
    if (!isAuthenticated) {
      writeLocalCart(nextItems);
      return;
    }

    const responses = await Promise.all(requests());
    const lastResponse = responses[responses.length - 1];
    setCartItems(
      extractCartPayload(lastResponse).items || normalizeCartItems(nextItems)
    );
    notifyCartUpdated();
  };

  const updateQuantity = (id, delta) => {
    const nextItems = cartItems.map((item) => (
      item.id === id
        ? {
            ...item,
            quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)),
          }
        : item
    ));
    const nextItem = nextItems.find((item) => item.id === id);
    return persistItems(
      nextItems,
      () => [updateCartItem(id, { quantity: nextItem.quantity })]
    );
  };

  const toggleSelect = (id) => {
    const nextItems = cartItems.map((item) => (
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
    const nextItem = nextItems.find((item) => item.id === id);
    return persistItems(
      nextItems,
      () => [updateCartItem(id, { selected: nextItem.selected })]
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    const nextItems = cartItems.map((item) => ({
      ...item,
      selected: !allSelected,
    }));
    return persistItems(
      nextItems,
      () => nextItems.map((item) => (
        updateCartItem(item.id, { selected: item.selected })
      ))
    );
  };

  const removeItem = (id) => {
    const nextItems = cartItems.filter((item) => item.id !== id);
    setCartItems(nextItems);
    if (!isAuthenticated) {
      writeLocalCart(nextItems);
      return Promise.resolve();
    }

    return removeCartItem(id).then((response) => {
      setCartItems(
        extractCartPayload(response).items || normalizeCartItems(nextItems)
      );
      notifyCartUpdated();
    });
  };

  return {
    cartItems,
    loading,
    error,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    removeItem,
  };
}
