import { useState } from "react";
import { createChatSession, createChatSessionWithUser, getChatSessionById, getAllChatSessions } from "../services/chatSession.service";
import { ChatSessionDTO } from "../types/chatSession";

export const useChatSession = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const startSessionGuest = async (dto: ChatSessionDTO) => {
        try {
            setLoading(true);
            const result = await createChatSession(dto);
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const startSessionUser = async (userId: string, propertyId: number) => {
        try {
            setLoading(true);
            const result = await createChatSessionWithUser(userId, propertyId);
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const getSession = async (id: number) => {
        try {
            setLoading(true);
            const result = await getChatSessionById(id);
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const getAllSessions = async () => {
        try {
            setLoading(true);
            const result = await getAllChatSessions();
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return {
        loading,
        error,
        startSessionGuest,
        startSessionUser,
        getSession,
        getAllSessions
    }
}
