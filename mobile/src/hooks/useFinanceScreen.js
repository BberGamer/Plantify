import { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import useFinance from "./useFinance";
import useScreenScope from "./useScreenScope";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";
import { amountError, reasonError } from "../utils/financeValidation";

export default function useFinanceScreen(admin, section) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const f = useFinance(admin, section);
  const { capture } = useScreenScope();
  const topupField = useRef(null);
  const [amount, setAmount] = useState(
    !admin &&
      section === "wallet" &&
      typeof params.amount === "string" &&
      /^\d{5,8}$/.test(params.amount)
      ? params.amount
      : "",
  );
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [searchError, setSearchError] = useState("");
  const searchVersion = useRef(0);
  const viewedOrder =
    dialog?.view && f.order?._id === dialog.view._id ? f.order : dialog?.view;
  const findCustomers = async () => {
    const version = ++searchVersion.current,
      scope = capture();
    try {
      const result = await userService.getUsers({
        search,
        role: "customer",
        limit: 10,
      });
      if (scope() && version === searchVersion.current) {
        setCustomers(result.data?.items || []);
        setSearchError("");
      }
    } catch (e) {
      if (scope() && version === searchVersion.current)
        setSearchError(getErrorMessage(e));
    }
  };
  const confirm = async () => {
    if (!dialog || f.busy) return;
    const invalid = dialog.adjust
      ? amountError(amount) || reasonError(reason)
      : !dialog.plan
        ? reasonError(reason)
        : "";
    if (invalid) {
      setValidationError(invalid);
      return;
    }
    let ok;
    if (dialog.plan) ok = await f.run("purchase", { plan: dialog.plan.code });
    else if (dialog.adjust)
      ok = await f.run("adjust", {
        user_id: customer?._id,
        amount: Number(amount),
        reason,
      });
    else
      ok = await f.run("review", { status: dialog.status, reason }, dialog.id);
    if (ok) {
      setDialog(null);
      setReason("");
    }
  };
  return {
    f,
    router,
    topupField,
    amount,
    setAmount,
    dialog,
    setDialog,
    reason,
    setReason,
    validationError,
    setValidationError,
    search,
    setSearch,
    customers,
    customer,
    setCustomer,
    searchError,
    findCustomers,
    viewedOrder,
    confirm,
  };
}
