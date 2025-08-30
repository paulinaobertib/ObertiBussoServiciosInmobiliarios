import { useState } from "react";
import { createChat } from "../services/chat.service";
import { useApiErrors } from "../../shared/hooks/useErrors";

interface ChatMessage {
  from: "user" | "system";
  content: string;
  options?: string[];
}

export const useChat = () => {
  const { handleError } = useApiErrors();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (option: string, propertyId: number, sessionId: number) => {
    setLoading(true);
    // mostramos el mensaje del usuario inmediatamente
    setMessages((prev) => [...prev, { from: "user", content: option }]);

    try {
      const res = await createChat(option, propertyId, sessionId);
      const reply = (res as any)?.data ?? res; // Axios-safe
      setMessages((prev) => [...prev, { from: "system", content: String(reply) }]);
      return reply;
    } catch (e) {
      handleError(e); // toast + string legible
    } finally {
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
  };
};