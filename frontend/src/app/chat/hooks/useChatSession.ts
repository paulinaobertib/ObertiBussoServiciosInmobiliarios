import { useState } from "react";
import {
  createChatSession,
  createChatSessionWithUser,
  getChatSessionById,
  getAllChatSessions,
} from "../services/chatSession.service";
import { ChatSessionDTO } from "../types/chatSession";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const useChatSession = () => {
  const [loading, setLoading] = useState(false);
  const { handleError } = useApiErrors();

  const startSessionGuest = async (dto: ChatSessionDTO) => {
    setLoading(true);
    try {
      const res = await createChatSession(dto);
      return (res as any)?.data ?? res;
    } catch (e) {
      handleError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const startSessionUser = async (userId: string, propertyId: number) => {
    setLoading(true);
    try {
      const res = await createChatSessionWithUser(userId, propertyId);
      return (res as any)?.data ?? res;
    } catch (e) {
      handleError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const getSession = async (id: number) => {
    setLoading(true);
    try {
      const res = await getChatSessionById(id);
      return (res as any)?.data ?? res;
    } catch (e) {
      handleError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const getAllSessions = async () => {
    setLoading(true);
    try {
      const res = await getAllChatSessions();
      return (res as any)?.data ?? res;
    } catch (e) {
      handleError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    startSessionGuest,
    startSessionUser,
    getSession,
    getAllSessions,
  };
};