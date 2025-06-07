import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getCommentById,
  getCommentsByPropertyId,
  postComment,
  putComment,
  deleteComment,
} from "../../../property/services/comment.service";
import { Comment, CommentCreate } from "../../../property/types/comment";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("comment.service", () => {
  const mockComment: Comment = {
    id: 1,
    description: "Pedir llave a Juan",
    propertyId: 10,
  };

  const mockCommentCreate: CommentCreate = {
    description: "Hablar con Maria",
    propertyId: 15,
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("obtiene comentario por ID", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockComment });

    const result = await getCommentById(1);
    expect(result).toEqual(mockComment);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/comment/getById/1`
    );
  });

  it("obtiene comentarios por ID de propiedad", async () => {
    mockedAxios.get.mockResolvedValue({ data: [mockComment] });

    const result = await getCommentsByPropertyId(10);
    expect(result).toEqual([mockComment]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/comment/property/10`
    );
  });

  it("crea un comentario", async () => {
    mockedAxios.post.mockResolvedValue({ data: mockComment });

    const result = await postComment(mockCommentCreate);
    expect(result).toEqual(mockComment);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/properties/comment/create`,
      mockCommentCreate,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  });

  it("actualiza un comentario", async () => {
    mockedAxios.put.mockResolvedValue({ data: mockComment });

    const result = await putComment(mockComment);
    expect(result).toEqual(mockComment);
    expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/comment/update`,
      mockComment
    );
  });

  it("elimina un comentario", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });

    const result = await deleteComment(mockComment);
    expect(result).toEqual({ success: true });
    expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/comment/delete/1`
    );
  });

  it("maneja error al obtener comentario por ID", async () => {
    const error = new Error("Not Found");
    mockedAxios.get.mockRejectedValue(error);

    await expect(getCommentById(1)).rejects.toThrow("Not Found");
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("maneja error al crear comentario", async () => {
    const error = new Error("Bad Request");
    mockedAxios.post.mockRejectedValue(error);

    await expect(postComment(mockCommentCreate)).rejects.toThrow("Bad Request");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it("maneja error al actualizar comentario", async () => {
    const error = new Error("Server Error");
    mockedAxios.put.mockRejectedValue(error);

    await expect(putComment(mockComment)).rejects.toThrow("Server Error");
    expect(mockedAxios.put).toHaveBeenCalledTimes(1);
  });

  it("maneja error al eliminar comentario", async () => {
    const error = new Error("Forbidden");
    mockedAxios.delete.mockRejectedValue(error);

    await expect(deleteComment(mockComment)).rejects.toThrow("Forbidden");
    expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
  });
});
