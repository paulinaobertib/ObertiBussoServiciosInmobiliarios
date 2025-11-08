import { api } from "../../../api";

export const createChat = async (option: string, propertyId: number, sessionId: number) => {
  try {
    const response = await api.post(`/properties/chat/message`, null, {
      params: { option, propertyId, sessionId },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};
