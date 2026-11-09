import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import useScreenScope from "./useScreenScope";
import { getSessionContext } from "../services/sessionAccess";
import chatService from "../services/chatService";
import getErrorMessage from "../utils/getErrorMessage";

export default function useChat() {
  const version = useAuthStore((state) => state.sessionVersion);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [hasOlder, setHasOlder] = useState(false);
  const conversation = useRef([]);
  const conversationId = useRef(null);
  const pending = useRef(null);
  const historyRequest = useRef(null);
  const timings = useRef(new Map());
  const measured = useRef(new Set());
  const { capture, isActive } = useScreenScope(() => { void loadHistory(); }, () => {
    abortAll();
    setSending(false); setLoadingHistory(false);
  });

  function abortAll() {
    pending.current?.abort(); pending.current = null;
    historyRequest.current?.abort(); historyRequest.current = null;
    for (const controller of timings.current.values()) controller.abort();
    timings.current.clear();
  }
  useEffect(() => {
    // Scope đã vô hiệu hóa callbacks của phiên cũ; không giữ hội thoại giữa hai user.
    pending.current?.abort(); pending.current = null;
    conversation.current = []; conversationId.current = null;
    setSending(false);
    measured.current.clear();
    setMessages([]); setDraft(""); setError(""); setHistoryError(""); setHasOlder(false);
  }, [version]);

  const updateMessages = (items) => { conversation.current = items; setMessages(items); };
  async function loadHistory() {
    if (!isActive() || pending.current || historyRequest.current) return;
    const context = getSessionContext();
    if (!context.token) return;
    const controller = new AbortController();
    historyRequest.current = controller;
    const current = capture();
    setLoadingHistory(true); setHistoryError("");
    try {
      const response = await chatService.loadHistory(context, controller.signal);
      if (!current() || controller.signal.aborted) return;
      const data = response?.data;
      if (response?.success !== true || !Array.isArray(data?.turns) || data.turns.some((turn) =>
        !turn.id || typeof turn.question !== "string" || typeof turn.answer !== "string")) throw new Error();
      conversationId.current = data.conversation_id;
      setHasOlder(!!data.next_cursor);
      updateMessages(data.turns.flatMap((turn) => [
        { id: `${turn.id}-user`, role: "user", content: turn.question },
        { id: turn.id, role: "assistant", content: turn.answer,
          client_response_ms: turn.client_response_ms,
          saved: true, answerSource: turn.answer_source },
      ]));
    } catch (failure) {
      if (current() && !controller.signal.aborted)
        setHistoryError(getErrorMessage(failure, "Chưa tải được lịch sử. Có thể thử lại hoặc bắt đầu cuộc trò chuyện mới."));
    } finally {
      if (historyRequest.current === controller) {
        historyRequest.current = null;
        if (current()) setLoadingHistory(false);
      }
    }
  }
  const send = async () => {
    if (pending.current || historyRequest.current || !isActive()) return;
    const message = draft.trim();
    if (!message || message.length > 2000) { setError("Vui lòng nhập tin nhắn từ 1 đến 2000 ký tự."); return; }
    const context = getSessionContext();
    if (!context.token) { setError("Vui lòng đăng nhập để trò chuyện."); return; }
    let history = conversation.current.slice(-20).map(({ role, content }) => ({ role, content }));
    while (history.reduce((sum, item) => sum + item.content.length, message.length) > 24000) history = history.slice(2);
    const sentAt = performance.now();
    const controller = new AbortController(); pending.current = controller;
    const current = capture(); setSending(true); setError("");
    try {
      const response = await chatService.sendMessage(message, history, context, controller.signal, conversationId.current);
      if (!current()) return;
      const reply = response?.data?.reply;
      if (response?.success !== true || typeof reply !== "string" || !reply.trim())
        throw Object.assign(new Error(), { code: "INVALID_RESPONSE" });
      const data = response.data;
      if (data.saved && data.conversation_id) conversationId.current = data.conversation_id;
      const id = data.message_id || `local-${Date.now()}`;
      updateMessages([...conversation.current,
        { id: `${id}-user`, role: "user", content: message },
        { id, role: "assistant", content: reply, saved: data.saved,
          sentAt },
      ].slice(-40));
      setDraft("");
    } catch (failure) {
      if (current() && !controller.signal.aborted) setError(getErrorMessage(failure, "Không thể gửi tin nhắn. Vui lòng thử lại."));
    } finally {
      if (pending.current === controller) { pending.current = null; if (current()) setSending(false); }
    }
  };
  const newConversation = () => {
    if (pending.current) return;
    abortAll(); updateMessages([]); conversationId.current = null;
    setDraft(""); setError(""); setHistoryError(""); setLoadingHistory(false); setHasOlder(false);
  };
  const markDisplayed = (id) => {
    const item = conversation.current.find((message) => message.id === id && message.role === "assistant");
    if (!item || !item.saved || typeof item.sentAt !== "number" || measured.current.has(id)) return;
    measured.current.add(id);
    const ms = Math.max(0, Math.round(performance.now() - item.sentAt));
    updateMessages(conversation.current.map((message) => message.id === id ? { ...message, client_response_ms: ms } : message));
    const current = capture();
    const controller = new AbortController(); timings.current.set(id, controller);
    chatService.recordTiming(id, ms, getSessionContext(), controller.signal).catch(() => {
      if (current() && !controller.signal.aborted) updateMessages(conversation.current.map((message) =>
        message.id === id ? { ...message, timing_error: true } : message));
    }).finally(() => timings.current.delete(id));
  };
  return { draft, messages, sending, error, send, loadingHistory, historyError, hasOlder,
    markDisplayed,
    reloadHistory: loadHistory, newConversation,
    changeDraft: (value) => { if (!pending.current) { setDraft(value); setError(""); } },
  };
}
