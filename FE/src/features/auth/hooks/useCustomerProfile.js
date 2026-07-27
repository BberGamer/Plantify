// useCustomerProfile.js - Quản lý thao tác tải và cập nhật hồ sơ khách hàng
import { useCallback } from "react";
import { toast } from "sonner";
import { useMyFavorites } from "@/features/favorites/hooks";
import { useMyOrders } from "@/features/orders/hooks";
import { useWallet } from "@/features/wallet/hooks";
import { useProfile } from "@/features/auth/hooks/useProfile";

function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/** Quản lý profile, đổi mật khẩu, đơn hàng và cây yêu thích của khách hàng. @returns {Object} State profile và các action liên quan. */
export function useCustomerProfile() {
  const profile = useProfile();
  const favoritesState = useMyFavorites();
  const ordersState = useMyOrders();
  const walletState = useWallet(profile.user?.role === "customer");

  const handleUnfavorite = useCallback(
    async (plantId, event) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await favoritesState.remove(plantId);
      } catch {}
    },
    [favoritesState.remove]
  );

  const handleCustomerAction = useCallback(
    async (orderId, action) => {
      const targetOrder = ordersState.orders.find(
        (order) => (order._id || order.id) === orderId
      );
      const hasWalletPayment = Number(targetOrder?.walletAmount || 0) > 0;
      const actionLabel = action === "succeeded"
        ? "Đã nhận hàng"
        : action === "cancelled"
          ? "Hủy đơn hàng"
          : "Yêu cầu hoàn trả";
      const confirmMessage = action === "succeeded"
        ? "Bạn xác nhận đã nhận được hàng?"
        : action === "cancelled"
          ? hasWalletPayment
            ? "Bạn có chắc muốn hủy đơn hàng này? Phần tiền đã thanh toán bằng ví sẽ được hoàn lại vào ví."
            : "Bạn có chắc muốn hủy đơn hàng này?"
          : "Bạn có muốn yêu cầu hoàn trả đơn hàng này không?";

      if (!window.confirm(confirmMessage)) return;

      try {
        const response = await ordersState.updateOrder(orderId, action);
        const refundedAmount = Number(
          response.data?.data?.order?.refundedAmount || 0
        );
        toast.success(
          action === "cancelled" && refundedAmount > 0
            ? `Hủy đơn hàng thành công! Đã hoàn ${formatVND(refundedAmount)} vào ví.`
            : `${actionLabel} thành công!`
        );
        await walletState.refetch();
      } catch (error) {
        console.error("Lỗi customer action:", error);
        toast.error(
          error.response?.data?.message || error.message || "Thao tác thất bại."
        );
      }
    },
    [ordersState.orders, ordersState.updateOrder, walletState.refetch]
  );

  return {
    ...profile,
    favorites: favoritesState.favorites,
    favLoading: favoritesState.loading,
    orders: ordersState.orders,
    ordersLoading: ordersState.loading,
    wallet: walletState.wallet,
    handleCustomerAction,
    handleUnfavorite,
  };
}
