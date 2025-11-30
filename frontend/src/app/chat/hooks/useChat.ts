import { useState } from "react";
import { createChat } from "../services/chat.service";
import { useApiErrors } from "../../shared/hooks/useErrors";

interface ChatMessage {
  from: "user" | "system";
  content: string;
  options?: string[];
}

interface SendMessageOptions {
  silent?: boolean;
  userDisplay?: string;
}

const SYSTEM_TYPING_DELAY = 1300;

export const useChat = () => {
  const { handleError } = useApiErrors();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (option: string, propertyId: number, sessionId: number, options?: SendMessageOptions) => {
    setLoading(true);
    const showTyping = !options?.silent;
    // mostramos el mensaje del usuario inmediatamente
    if (showTyping) {
      setMessages((prev) => [...prev, { from: "user", content: options?.userDisplay ?? option }]);
      setIsTyping(true);
    }

    try {
      const res = await createChat(option, propertyId, sessionId);
      const reply = (res as any)?.data ?? res; // Axios-safe
      if (showTyping) {
        await new Promise((resolve) => setTimeout(resolve, SYSTEM_TYPING_DELAY));
        setMessages((prev) => [...prev, { from: "system", content: String(reply) }]);
      }
      return reply;
    } catch (e) {
      handleError(e); // toast + string legible
    } finally {
      if (showTyping) {
        setIsTyping(false);
      }
      setLoading(false);
    }
  };

  const addSystemMessage = (content: string) => {
    setMessages((prev) => [...prev, { from: "system", content }]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { from: "user", content }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    sendMessage,
    addSystemMessage,
    addUserMessage,
    clearMessages,
    isTyping,
  };
};
