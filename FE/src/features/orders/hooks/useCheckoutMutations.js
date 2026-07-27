// useCheckoutMutations.js - Quản lý trạng thái các thao tác tạo và thanh toán đơn hàng
import { useCallback, useState } from "react";
import { getMyAddressesApi } from "@/features/auth/api";
import { getCart } from "@/features/cart/api";
import {
  createOrder,
  createVnpayPayment,
  verifyVnpayPayment,
} from "@/features/orders/api";
import { getMyWallet } from "@/features/wallet/api";

export function useCheckoutMutations() {
  const [pending, setPending] = useState({});
  const [errors, setErrors] = useState({});

  const execute = useCallback(async (key, request) => {
    setPending((current) => ({ ...current, [key]: true }));
    setErrors((current) => ({ ...current, [key]: null }));
    try {
      return await request();
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: error }));
      throw error;
    } finally {
      setPending((current) => ({ ...current, [key]: false }));
    }
  }, []);

  return {
    loadAddresses: useCallback(
      () => execute("addresses", getMyAddressesApi),
      [execute]
    ),
    loadCart: useCallback(
      () => execute("cart", getCart),
      [execute]
    ),
    loadWallet: useCallback(
      () => execute("wallet", getMyWallet),
      [execute]
    ),
    verifyPayment: useCallback(
      (params) => execute("verifyPayment", () => verifyVnpayPayment(params)),
      [execute]
    ),
    submitOrder: useCallback(
      (payload) => execute("order", () => createOrder(payload)),
      [execute]
    ),
    createPayment: useCallback(
      (payload) => execute("payment", () => createVnpayPayment(payload)),
      [execute]
    ),
    pending,
    errors,
  };
}
