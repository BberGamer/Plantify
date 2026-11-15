import { useCallback, useRef, useState } from "react";
import service from "../services/chatFaqManagementService";
import usePaginatedList from "./usePaginatedList";
import useDebouncedValue from "./useDebouncedValue";
import useScreenScope from "./useScreenScope";
import getErrorMessage from "../utils/getErrorMessage";

const empty = () => ({ question: "", answer: "", topic: "", aliases: "" });
export default function useManagerFaqs() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const query = useDebouncedValue(search.trim());
  const fetchPage = useCallback(params => (tab === "turns" ? service.listTurns : service.list)({ ...params, search: query.value }), [query.value, tab]);
  const list = usePaginatedList(fetchPage, { limit: 20, enabled: !query.pending });
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [draft, setDraft] = useState(empty);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const scope = useScreenScope(
    () => setBusy(lock.current),
    () => { setForm(null); setDeleteTarget(null); setError(""); setMessage(""); },
  );
  const open = (item = null, review = false) => {
    if (lock.current) return;
    setError(""); setMessage("");
    setDraft(item ? { question: item.question, answer: item.answer, topic: item.topic || "", aliases: (item.aliases || []).join("\n") } : empty());
    setForm({ item, review });
  };
  const close = () => { if (!lock.current) { setForm(null); setError(""); } };
  const changeField = (field, value) => { if (!lock.current) setDraft(current => ({ ...current, [field]: value })); };
  const mutate = async (action, success) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    const current = scope.capture();
    try {
      const response = await action();
      if (response?.success !== true) throw Object.assign(new Error("Invalid response"), { code: "INVALID_RESPONSE" });
      if (!current()) return;
      setForm(null); setDeleteTarget(null); setMessage(success);
      await list.retry();
    } catch (failure) {
      if (current()) setError(getErrorMessage(failure, "Không thể cập nhật FAQ. Vui lòng thử lại."));
    } finally {
      lock.current = false;
      if (scope.isActive()) setBusy(false);
    }
  };
  const save = () => {
    if (!form || form.review) return;
    if (!draft.question.trim() || !draft.answer.trim()) {
      setError("Vui lòng nhập câu hỏi và câu trả lời."); return;
    }
    const payload = { ...draft, aliases: draft.aliases.split(/\r?\n/).map(value => value.trim()).filter(Boolean), language: "vi" };
    const item = form.item;
    return mutate(() => item ? service.update(item._id, { ...payload, version: item.version }) : service.create(payload),
      "Đã lưu bản nháp. FAQ cần được duyệt để sử dụng trong chat.");
  };
  const changeApproval = () => {
    if (!form?.review || !form.item) return;
    const item = form.item;
    return mutate(() => item.status === "approved" ? service.unapprove(item._id, item.version) : service.approve(item._id, item.version),
      item.status === "approved" ? "Đã gỡ duyệt. FAQ ngừng sử dụng trong chat." : "Đã duyệt FAQ để sử dụng trong chat.");
  };
  const requestDelete = item => {
    if (!lock.current) { setError(""); setMessage(""); setDeleteTarget(item); }
  };
  const cancelDelete = () => { if (!lock.current) { setDeleteTarget(null); setError(""); } };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const item = deleteTarget;
    return mutate(() => service.remove(item._id, item.version), "Đã xóa FAQ.");
  };
  return { ...list, listError: list.error, search, tab, form, draft, error, message, busy, open, close, changeField, save, changeApproval,
    deleteTarget, requestDelete, cancelDelete, confirmDelete,
    changeSearch: value => { if (!lock.current) {
      setSearch(value);
      if (value.trim() !== query.value) list.invalidate();
    } },
    changeTab: value => { if (!lock.current) { setTab(value); query.flush(); setError(""); setMessage(""); } },
    refresh: () => { if (!lock.current) return list.refresh(); },
  };
}
