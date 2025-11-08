import { ChatSessionDTO } from "../types/chatSession";
import { api } from "../../../api";

export const createChatSession = async (body: ChatSessionDTO) => {
  try {
    const response = await api.post(`/properties/chatSession/create`, body);
    return response.data;
  } catch (error) {
    console.error("Error creating chatSession:", error);
    throw error;
  }
};

export const createChatSessionWithUser = async (userId: string, propertyId: number) => {
  try {
    const response = await api.post(`/properties/chatSession/createUser`, null, {
      params: { userId, propertyId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating chat session for user:", error);
    throw error;
  }
};

export const getChatSessionById = async (id: number) => {
  try {
    const response = await api.get(`/properties/chatSession/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chat session by ID:", error);
    throw error;
  }
};

export const getAllChatSessions = async () => {
  try {
    const response = await api.get(`/properties/chatSession/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all chat sessions:", error);
    throw error;
  }
};
