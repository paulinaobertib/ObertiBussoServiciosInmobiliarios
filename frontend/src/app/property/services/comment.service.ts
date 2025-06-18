import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
import { Comment, CommentCreate } from "../types/comment";

export const getCommentById = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/comment/getById/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching comment with ID ${id}:`, error);
    throw error;
  }
};

export const getCommentsByPropertyId = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/comment/property/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for property ID ${id}:`, error);
    throw error;
  }
};

export const postComment = async (commentData: CommentCreate) => {
  try {
    const response = await axios.post(
      `${apiUrl}/properties/comment/create`,
      commentData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const putComment = async (commentData: Comment) => {
  try {
    const response = await axios.put(
      `${apiUrl}/properties/comment/update`,
      commentData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving comment:", error);
    throw error;
  }
};

export const deleteComment = async (commentData: Comment) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/properties/comment/delete/${commentData.id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
