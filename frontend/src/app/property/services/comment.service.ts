import { Comment, CommentCreate } from "../types/comment";
import { api } from "../../../api";

export const getCommentById = async (id: number) => {
  try {
    const response = await api.get(`/properties/comment/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching comment with ID ${id}:`, error);
    throw error;
  }
};

export const getCommentsByPropertyId = async (id: number) => {
  try {
    const response = await api.get(`/properties/comment/property/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for property ID ${id}:`, error);
    throw error;
  }
};

export const postComment = async (commentData: CommentCreate) => {
  try {
    const response = await api.post(`/properties/comment/create`, commentData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const putComment = async (commentData: Comment) => {
  try {
    const response = await api.put(`/properties/comment/update`, commentData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving comment:", error);
    throw error;
  }
};

export const deleteComment = async (commentData: Comment) => {
  try {
    const response = await api.delete(
      `/properties/comment/delete/${commentData.id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
