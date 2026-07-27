// useLoginFlow.js - Quản lý trạng thái biểu mẫu và tiến trình đăng nhập
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useCartMutations } from "@/features/cart/hooks";
import { mapBackendRoleToFeRole } from "@/lib/roles";
import { useLoginMutation } from "@/features/auth/hooks/useAuthMutations";

function getRedirectPath(role) {
  switch (mapBackendRoleToFeRole(role)) {
    case "admin":
      return "/admin";
    case "business_manager":
      return "/business";
    case "content_manager":
      return "/content/plants";
    default:
      return "/";
  }
}

export function useLoginFlow() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loggingIn, loginUser } = useLoginMutation();
  const { loading: cartLoading, mergeLocalCart } = useCartMutations();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    if (!/^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.com|fpt\.edu\.vn)$/i.test(email)) {
      toast.error("Email không đúng định dạng");
      return;
    }

    try {
      const user = await loginUser(email, password);
      toast.success(`Chào mừng trở lại, ${user.fullName}!`);
      if (mapBackendRoleToFeRole(user.role) === "customer") {
        try {
          await mergeLocalCart();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Không thể đồng bộ giỏ hàng."
          );
        }
      }
      navigate(
        location.state?.from || getRedirectPath(user.role),
        { replace: true }
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message
        || error.message
        || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };

  return {
    email,
    handleSubmit,
    password,
    setEmail,
    setPassword,
    submitting: loggingIn || cartLoading,
  };
}
