// useWallet.js - Quản lý trạng thái số dư, giao dịch và thao tác nạp tiền ví
import { useCallback, useEffect, useState } from "react";
import { getMyWallet } from "@/features/wallet/api";

const EMPTY_WALLET = { balance: 0, transactions: [] };

export function useWallet(enabled = true) {
  const [wallet, setWallet] = useState(EMPTY_WALLET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled) return EMPTY_WALLET;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMyWallet();
      const nextWallet = data?.data || EMPTY_WALLET;
      setWallet(nextWallet);
      return nextWallet;
    } catch (requestError) {
      setWallet(EMPTY_WALLET);
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const refreshWallet = () => {
      refetch().catch(() => {});
    };
    refreshWallet();
    window.addEventListener("wallet-updated", refreshWallet);
    return () => window.removeEventListener("wallet-updated", refreshWallet);
  }, [enabled, refetch]);

  return { wallet, loading, error, refetch };
}
