import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import service from "../services/financeService";
import useScreenScope from "./useScreenScope";
import getErrorMessage from "../utils/getErrorMessage";
import { getSessionContext, isSessionCurrent } from "../services/sessionAccess";

export function useFinanceSummary(enabled = true) {
  const [summary, setSummary] = useState(null);
  useFocusEffect(useCallback(() => {
    let active = true;
    const origin = getSessionContext();
    setSummary(null);
    const refresh = () => {
      if (enabled) service.summary().then((value) => {
        if (active && isSessionCurrent(origin)) setSummary(value);
      }).catch(() => { if (active && isSessionCurrent(origin)) setSummary(null); });
    };
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); };
  }, [enabled]));
  return summary;
}

export default function useFinance(admin = false, section = "history") {
  const [summary, setSummary] = useState(null);
  const [kind, setKind] = useState(!admin && section === "history" ? "transactions" : "orders");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState({ items: [], totalPages: 0 });
  const [order, setOrder] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef(false);
  const request = useRef(0);
  const keys = useRef(new Map());
  const orderRequest = useRef(0);
  const { capture, isActive } = useScreenScope();
  useEffect(() => {
    if (!order || order.status !== "pending") return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [order?._id, order?.status]);
  const openOrder = async (item) => {
    const requestId = ++orderRequest.current;
    setOrder(item);
    const scope = capture();
    try { const updated = await service.order(item._id); if (scope() && requestId === orderRequest.current) setOrder(updated); }
    catch (e) { if (scope()) setMessage(getErrorMessage(e)); }
  };
  const refresh = useCallback(async () => {
    const current = ++request.current;
    const scope = capture();
    setLoading(true);
    try {
      const [result, wallet] = await Promise.all([
        admin || section === "history"
          ? service.list(kind, { page, ...(filter ? { [kind === "transactions" ? "type" : "status"]: filter } : {}) }, admin)
          : Promise.resolve({ items: [], totalPages: 0 }),
        admin || section === "history" ? null : service.summary(),
      ]);
      if (!scope() || current !== request.current) return;
      setList(result); setSummary(wallet);
    } catch (e) { if (scope() && current === request.current) setMessage(getErrorMessage(e)); }
    finally { if (scope() && current === request.current) setLoading(false); }
  }, [admin, section, kind, filter, page, capture]);
  useFocusEffect(useCallback(() => {
    orderRequest.current++;
    setList({ items: [], totalPages: 0 }); setSummary(null); setMessage(""); setOrder(null);
    refresh();
    return () => { request.current++; };
  }, [refresh]));
  useFocusEffect(useCallback(() => {
    if (!order || order.status !== "pending" || order.expired) return;
    const scope = capture();
    let stopped = false, polling = false;
    const poll = async () => {
      if (polling || stopped) return;
      polling = true;
      try {
        const updated = await service.order(order._id);
        if (!stopped && scope()) {
          setOrder(updated);
          if (updated.status !== "pending") { setMessage(updated.status === "success" ? "Đã nạp tiền vào ví." : "Đơn nạp đã bị từ chối."); refresh(); }
        }
      } catch { /* Giữ đơn để người dùng tải lại khi mạng trở lại. */ }
      finally { polling = false; }
    };
    const timer = setInterval(poll, 5000);
    return () => { stopped = true; clearInterval(timer); };
  }, [order?._id, order?.status, order?.expired, capture, refresh]));
  const run = async (operation, payload, id) => {
    if (pending.current || !isActive()) return false;
    pending.current = true; setBusy(true); setMessage("");
    const scope = capture();
    // Giữ cùng key khi timeout: retry không cộng/trừ tiền lần hai.
    const fingerprint = JSON.stringify([operation, payload, id]);
    if (!keys.current.has(fingerprint)) keys.current.set(fingerprint,
      `req_${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`);
    try {
      const body = { ...payload, request_key: keys.current.get(fingerprint) };
      const value = operation === "review" ? await service.review(id, body) : await service[operation](body);
      if (!scope()) return false;
      keys.current.delete(fingerprint);
      if (operation === "topup") { orderRequest.current++; setOrder(value); }
      setMessage(operation === "purchase" ? "Nâng cấp VIP thành công!" : operation === "topup" ? "Đã tạo đơn nạp tiền." : "Đã ghi nhận giao dịch.");
      await refresh();
      return true;
    } catch (e) {
      if (scope()) setMessage(getErrorMessage(e));
      // Lỗi nghiệp vụ đã phản hồi rõ ràng: lần thử sau là thao tác mới.
      if (e.response?.status >= 400 && e.response?.status < 500) keys.current.delete(fingerprint);
      return false;
    } finally { pending.current = false; if (isActive()) setBusy(false); }
  };
  return { summary, kind, filter, page, list, order, loading, busy, message, run, refresh, openOrder,
    remainingSeconds: order ? Math.max(0, Math.ceil((new Date(order.expires_at).getTime() - now) / 1000)) : 0,
    selectKind: (value) => { if (!pending.current) { setKind(value); setFilter(""); setPage(1); } },
    selectFilter: (value) => { if (!pending.current) { setFilter(value); setPage(1); } },
    changePage: (value) => { if (!pending.current) setPage(value); },
    closeOrder: () => { orderRequest.current++; setOrder(null); },
  };
}
