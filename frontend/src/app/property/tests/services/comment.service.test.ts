import { describe, it, vi, expect, beforeEach } from "vitest";
import { api } from "../../../../api";
import {
  getCommentById,
  getCommentsByPropertyId,
  postComment,
  putComment,
  deleteComment,
} from "../../services/comment.service";
import { Comment, CommentCreate } from "../../types/comment";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("comment.service", () => {
  const mockComment: Comment = {
    id: 1,
    description: "Test comment",
    date: "2025-05-21",
    propertyId: 99,
    userId: "",
  };

  const mockCommentCreate: CommentCreate = {
    description: "New comment",
    propertyId: 99,
    userId: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCommentById llama al endpoint correcto y devuelve data", async () => {
    (api.get as any).mockResolvedValue({ data: mockComment });
    const result = await getCommentById(1);
    expect(api.get).toHaveBeenCalledWith(
      "/properties/comment/getById/1",
      expect.objectContaining({ withCredentials: true })
    );
    expect(result).toEqual(mockComment);
  });

  it("getCommentsByPropertyId llama al endpoint correcto", async () => {
    (api.get as any).mockResolvedValue({ data: [mockComment] });
    const result = await getCommentsByPropertyId(99);
    expect(api.get).toHaveBeenCalledWith(
      "/properties/comment/property/99",
      expect.objectContaining({ withCredentials: true })
    );
    expect(result).toEqual([mockComment]);
  });

  it("postComment hace POST con commentData y devuelve data", async () => {
    (api.post as any).mockResolvedValue({ data: mockComment });
    const result = await postComment(mockCommentCreate);
    expect(api.post).toHaveBeenCalledWith(
      "/properties/comment/create",
      mockCommentCreate,
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
    );
    expect(result).toEqual(mockComment);
  });

  it("putComment hace PUT con commentData y devuelve data", async () => {
    (api.put as any).mockResolvedValue({ data: mockComment });
    const result = await putComment(mockComment);
    expect(api.put).toHaveBeenCalledWith(
      "/properties/comment/update",
      mockComment,
      expect.objectContaining({ withCredentials: true })
    );
    expect(result).toEqual(mockComment);
  });

  it("deleteComment hace DELETE con el id correcto y devuelve data", async () => {
    (api.delete as any).mockResolvedValue({ data: "ok" });
    const result = await deleteComment(mockComment);
    expect(api.delete).toHaveBeenCalledWith(
      "/properties/comment/delete/1",
      expect.objectContaining({ withCredentials: true })
    );
    expect(result).toEqual("ok");
  });

  // --- Error cases ---
  it("lanza error si api falla en getCommentById", async () => {
    (api.get as any).mockRejectedValue(new Error("API error"));
    await expect(getCommentById(1)).rejects.toThrow("API error");
  });

  it("lanza error si api falla en getCommentsByPropertyId", async () => {
    (api.get as any).mockRejectedValue(new Error("fetch failed"));
    await expect(getCommentsByPropertyId(99)).rejects.toThrow("fetch failed");
  });

  it("lanza error si api falla en postComment", async () => {
    (api.post as any).mockRejectedValue(new Error("post failed"));
    await expect(postComment(mockCommentCreate)).rejects.toThrow("post failed");
  });

  it("lanza error si api falla en putComment", async () => {
    (api.put as any).mockRejectedValue(new Error("put failed"));
    await expect(putComment(mockComment)).rejects.toThrow("put failed");
  });

  it("lanza error si api falla en deleteComment", async () => {
    (api.delete as any).mockRejectedValue(new Error("delete failed"));
    await expect(deleteComment(mockComment)).rejects.toThrow("delete failed");
  });

  it("deleteComment con id inexistente", async () => {
    const nonexistentComment: Comment = {
      id: 999,
      description: "No existe",
      date: "2025-05-21",
      propertyId: 99,
      userId: "",
    };
    (api.delete as any).mockResolvedValue({ data: null });
    const result = await deleteComment(nonexistentComment);
    expect(result).toBeNull();
  });
});
