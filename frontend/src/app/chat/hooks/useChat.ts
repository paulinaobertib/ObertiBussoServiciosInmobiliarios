import { useState } from "react";
import { createChat } from "../services/chat.service";

interface ChatMessage {
    from: "user" | "system";
    content: string;
    options?: string[];
}

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const sendMessage = async(option: string, propertyId: number, sessionId: number) => {
        try {
            setLoading(true);
            setMessages((prev) => [...prev, { from: "user", content: option}])
            const result = await createChat(option, propertyId, sessionId);
            setMessages((prev) => [...prev, { from: "system", content: result}])
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const clearMessages = () => {
        setMessages([]);
    };

    return {
        messages,
        loading,
        error,
        sendMessage,
        clearMessages
    }
}