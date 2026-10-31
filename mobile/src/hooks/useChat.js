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
  const conversation = useRef([]);
  const pending = useRef(null);
  const { capture, isActive } = useScreenScope(undefined, () => {
    pending.current?.abort();
    pending.current = null;
    setSending(false);
  });

  useEffect(() => {
    pending.current?.abort();
    pending.current = null;
    conversation.current = [];
    setMessages([]);
    setDraft("");
    setError("");
    setSending(false);
  }, [version]);

  const send = async () => {
    if (pending.current || !isActive()) return;
    const message = draft.trim();
    if (!message || message.length > 2000) {
      setError("Vui lòng nhập tin nhắn từ 1 đến 2000 ký tự.");
      return;
    }
    const context = getSessionContext();
    if (!context.token) {
      setError("Vui lòng đăng nhập để trò chuyện.");
      return;
    }
    // Chỉ gửi các cặp hỏi/đáp hoàn tất, bỏ cặp cũ nhất khi vượt ngân sách.
    let history = conversation.current.slice(-20);
    while (history.reduce((sum, item) => sum + item.content.length, message.length) > 24000)
      history = history.slice(2);
    const controller = new AbortController();
    pending.current = controller;
    const current = capture();
    setSending(true);
    setError("");
    try {
      const response = await chatService.sendMessage(message, history, context, controller.signal);
      if (!current()) return;
      const reply = response?.data?.reply;
      if (response?.success !== true || typeof reply !== "string" || !reply.trim())
        throw Object.assign(new Error(), { code: "INVALID_RESPONSE" });
      conversation.current = [
        ...conversation.current,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ].slice(-40);
      setMessages(conversation.current);
      setDraft("");
    } catch (failure) {
      if (current() && !controller.signal.aborted)
        setError(getErrorMessage(failure, "Không thể gửi tin nhắn. Vui lòng thử lại."));
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        if (current()) setSending(false);
      }
    }
  };

  return {
    draft, messages, sending, error, send,
    changeDraft: (value) => {
      if (!pending.current) { setDraft(value); setError(""); }
    },
  };
}
