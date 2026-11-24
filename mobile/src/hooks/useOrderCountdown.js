import { useEffect, useState } from "react";

export default function useOrderCountdown(order) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!order || order.status !== "pending") return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [order?._id, order?.status]);
  return order
    ? Math.max(
        0,
        Math.ceil((new Date(order.expires_at).getTime() - now) / 1000),
      )
    : 0;
}
