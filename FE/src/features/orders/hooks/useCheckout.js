import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks";
import {
  extractCartPayload,
  notifyCartUpdated,
} from "@/features/cart/cartStorage";
import { useCheckoutMutations } from "@/features/orders/hooks/useCheckoutMutations";

const SHIPPING_FEE = 30000;
const EMPTY_FORM = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

export function useCheckout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    createPayment,
    loadAddresses,
    loadCart,
    loadWallet,
    submitOrder,
    verifyPayment,
  } = useCheckoutMutations();
  const isVnpayCallback = new URLSearchParams(window.location.search)
    .has("vnp_ResponseCode");

  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(!isVnpayCallback);
  const [orderCode, setOrderCode] = useState("");
  const [orderTotal, setOrderTotal] = useState(null);
  const verificationStarted = useRef(false);

  const completeOrder = useCallback((order, successMessage) => {
    setOrderCode(order.orderCode);
    setSubtotal(order.subtotal ?? subtotal);
    setOrderTotal(
      Math.max(0, Number(order.total || 0) - Number(order.walletAmount || 0))
    );
    setIsSuccess(true);
    notifyCartUpdated();
    toast.success(successMessage);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }, [subtotal]);

  const handleVnpayReturn = useCallback(async () => {
    setIsProcessing(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const vnpParams = Object.fromEntries(searchParams.entries());
      const { data } = await verifyPayment(vnpParams);

      if (data.success && data.data.code === "00") {
        const order = data.data.order;
        setForm({
          fullName: order.shippingInfo.fullName,
          phone: order.shippingInfo.phone,
          email: order.shippingInfo.email,
          address: order.shippingInfo.address,
          notes: order.shippingInfo.notes || "",
        });
        setPaymentMethod("BANK");
        completeOrder(order, "Đặt hàng thành công!");
      } else {
        setIsFailed(true);
        toast.error("Thanh toán không thành công hoặc đã bị hủy.");
      }
      window.history.replaceState({}, "", "/checkout");
    } catch (error) {
      console.error("Lỗi xác thực VNPay:", error);
      setIsFailed(true);
      toast.error("Có lỗi xảy ra khi xác thực thanh toán.");
      window.history.replaceState({}, "", "/checkout");
    } finally {
      setIsProcessing(false);
    }
  }, [completeOrder, verifyPayment]);

  useEffect(() => {
    if (!isVnpayCallback || verificationStarted.current) return;
    verificationStarted.current = true;
    handleVnpayReturn();
  }, [handleVnpayReturn, isVnpayCallback]);

  useEffect(() => {
    if (isVnpayCallback || !user) return;
    setForm((current) => ({
      ...current,
      fullName: user.fullName || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
    }));
  }, [isVnpayCallback, user]);

  useEffect(() => {
    if (isVnpayCallback || authLoading || !isAuthenticated) return;
    let cancelled = false;
    loadAddresses()
      .then((response) => {
        if (cancelled) return;
        const defaultAddress = (response?.data || [])
          .find((address) => address.isDefault);
        if (!defaultAddress) return;
        setForm((current) => ({
          ...current,
          fullName: defaultAddress.receiverName || current.fullName,
          phone: defaultAddress.phone || current.phone,
          address: defaultAddress.fullAddress || current.address,
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    isVnpayCallback,
    loadAddresses,
  ]);

  useEffect(() => {
    if (isVnpayCallback || authLoading) return;
    if (!isAuthenticated) {
      setIsLoadingCart(false);
      return;
    }

    let cancelled = false;
    setIsLoadingCart(true);
    loadCart()
      .then((response) => {
        if (cancelled) return;
        const selected = (extractCartPayload(response).items || [])
          .filter((item) => item.selected);
        setSelectedItems(selected);
        setSubtotal(selected.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ));
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login", { state: { from: "/checkout" }, replace: true });
          return;
        }
        toast.error(error.response?.data?.message || "Không thể tải giỏ hàng.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCart(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    isVnpayCallback,
    loadCart,
    navigate,
  ]);

  useEffect(() => {
    if (isVnpayCallback || authLoading || !isAuthenticated) return;
    let cancelled = false;
    loadWallet()
      .then(({ data }) => {
        if (!cancelled) {
          setWalletBalance(Number(data?.data?.balance || 0));
        }
      })
      .catch(() => {
        if (!cancelled) setWalletBalance(0);
      });
    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    isVnpayCallback,
    loadWallet,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ và tên người nhận";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10,11}$/.test(form.phone.trim().replace(/\s/g, ""))) {
      nextErrors.phone = "Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Vui lòng nhập địa chỉ email";
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Địa chỉ email không đúng định dạng";
    }
    if (!form.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ nhận hàng";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (selectedItems.length === 0) {
      toast.error("Không có sản phẩm nào được chọn để thanh toán.");
      return;
    }
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và đúng thông tin giao hàng!");
      return;
    }
    if (!localStorage.getItem("token")) {
      toast.error("Vui lòng đăng nhập để đặt hàng.");
      navigate("/login");
      return;
    }

    const orderData = {
      items: selectedItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      })),
      shippingInfo: { ...form },
      subtotal,
      shippingFee: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
      totalAmount: subtotal + SHIPPING_FEE,
      useWallet,
    };

    setIsSubmitting(true);
    try {
      if (paymentMethod === "COD") {
        const { data } = await submitOrder(orderData);
        if (data.success) completeOrder(data.data.order, "Đặt hàng thành công!");
      } else {
        const { data } = await createPayment(orderData);
        if (data.success) {
          if (data.data.paidWithWallet || !data.data.paymentUrl) {
            completeOrder(
              data.data.order,
              "Thanh toán bằng ví thành công!"
            );
          } else {
            window.location.href = data.data.paymentUrl;
          }
        }
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      toast.error(
        error.response?.data?.message
        || "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutTotal = subtotal + SHIPPING_FEE;
  const walletApplied = useWallet
    ? Math.min(walletBalance, checkoutTotal)
    : 0;

  return {
    authLoading,
    checkoutTotal,
    errors,
    form,
    handleInputChange,
    handlePlaceOrder,
    isFailed,
    isLoadingCart,
    isProcessing,
    isSubmitting,
    isSuccess,
    orderCode,
    orderTotal,
    paymentMethod,
    remainingAmount: checkoutTotal - walletApplied,
    retryPayment: () => {
      setIsFailed(false);
      window.location.reload();
    },
    selectedItems,
    setPaymentMethod,
    setUseWallet,
    shippingFee: SHIPPING_FEE,
    subtotal,
    useWallet,
    walletApplied,
    walletBalance,
  };
}
