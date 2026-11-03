import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import useScreenScope from "./useScreenScope";
import { getSessionContext } from "../services/sessionAccess";
import chatService from "../services/chatService";
import getErrorMessage from "../utils/getErrorMessage";

const wait = (signal) => new Promise((resolve) => {
  const done = () => { clearTimeout(timer); signal.removeEventListener("abort", done); resolve(); };
  const timer = setTimeout(done, 2000);
  signal.addEventListener("abort", done, { once: true });
  if (signal.aborted) done();
});

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
  const evaluations = useRef(new Map());
  const queue = useRef(Promise.resolve());
  const { capture, isActive } = useScreenScope(() => { void loadHistory(); }, () => {
    abortAll();
    setSending(false); setLoadingHistory(false);
  });

  function abortAll() {
    pending.current?.abort(); pending.current = null;
    historyRequest.current?.abort(); historyRequest.current = null;
    for (const controller of evaluations.current.values()) controller.abort();
    evaluations.current.clear(); queue.current = Promise.resolve();
  }
  useEffect(() => {
    // Scope đã vô hiệu hóa callbacks của phiên cũ; không giữ hội thoại giữa hai user.
    pending.current?.abort(); pending.current = null;
    for (const controller of evaluations.current.values()) controller.abort();
    evaluations.current.clear(); queue.current = Promise.resolve();
    conversation.current = []; conversationId.current = null;
    setSending(false);
    setMessages([]); setDraft(""); setError(""); setHistoryError(""); setHasOlder(false);
  }, [version]);

  const updateMessages = (items) => { conversation.current = items; setMessages(items); };
  const updateEvaluation = (id, evaluation) => updateMessages(conversation.current.map((item) =>
    item.id === id && item.role === "assistant" ? { ...item, evaluation } : item));

  async function evaluateTurn(id) {
    if (!id || !isActive() || evaluations.current.has(id)) return;
    const controller = new AbortController();
    evaluations.current.set(id, controller);
    const current = capture();
    const context = getSessionContext();
    updateEvaluation(id, { status: "processing" });
    try {
      let response = await chatService.evaluate(id, context, controller.signal);
      if (response?.success !== true || !response.data?.status) throw new Error();
      for (let poll = 0; response.data.status === "processing" && poll < 30 && current() && !controller.signal.aborted; poll++) {
        await wait(controller.signal);
        if (!current() || controller.signal.aborted) return;
        response = await chatService.getEvaluation(id, context, controller.signal);
        if (response?.success !== true || !response.data?.status) throw new Error();
      }
      if (current() && !controller.signal.aborted) updateEvaluation(id, response.data);
    } catch (failure) {
      if (current() && !controller.signal.aborted) updateEvaluation(id, {
        status: "failed", message: getErrorMessage(failure, "Chưa tải được đánh giá. Bạn có thể thử lại."),
      });
    } finally {
      if (evaluations.current.get(id) === controller) evaluations.current.delete(id);
    }
  }
  function enqueueEvaluation(id) {
    const current = capture();
    queue.current = queue.current.catch(() => {}).then(() => current() ? evaluateTurn(id) : undefined);
  }

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
        { id: turn.id, role: "assistant", content: turn.answer, evaluation: turn.evaluation,
          saved: true, answerSource: turn.answer_source },
      ]));
      for (const turn of data.turns) if (turn.evaluation_enabled &&
        ["not_requested", "processing"].includes(turn.evaluation?.status)) enqueueEvaluation(turn.id);
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
          evaluation: data.evaluation || { status: "disabled" } },
      ].slice(-40));
      setDraft("");
      if (data.message_id && data.evaluation_enabled) enqueueEvaluation(data.message_id);
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
  return { draft, messages, sending, error, send, loadingHistory, historyError, hasOlder,
    reloadHistory: loadHistory, newConversation, retryEvaluation: enqueueEvaluation,
    changeDraft: (value) => { if (!pending.current) { setDraft(value); setError(""); } },
  };
}
