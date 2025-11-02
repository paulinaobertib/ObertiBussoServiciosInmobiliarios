import { describe, it, expect, vi, beforeEach } from "vitest";
import { postSuggestion, getAllSuggestions } from "../../services/suggestion.service";
import { api } from "../../../../api";

vi.mock("../../../../api");

describe("suggestion.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postSuggestion", () => {
    it("debe enviar una sugerencia correctamente", async () => {
      const mockResponse = { id: 1, description: "Test", date: "2024-01-01" };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const data = { description: "Test suggestion" };
      const result = await postSuggestion(data);

      expect(api.post).toHaveBeenCalledWith(
        "/properties/suggestions/create",
        expect.any(FormData)
      );
      expect(result).toEqual(mockResponse);
    });

    it("debe manejar errores al enviar sugerencia", async () => {
      const error = new Error("Network error");
      (api.post as any).mockRejectedValue(error);

      const data = { description: "Test" };

      await expect(postSuggestion(data)).rejects.toThrow("Network error");
    });
  });

  describe("getAllSuggestions", () => {
    it("debe obtener todas las sugerencias", async () => {
      const mockSuggestions = [
        { id: 1, description: "Suggestion 1", date: "2024-01-01" },
        { id: 2, description: "Suggestion 2", date: "2024-01-02" },
      ];
      (api.get as any).mockResolvedValue({ data: mockSuggestions });

      const result = await getAllSuggestions();

      expect(api.get).toHaveBeenCalledWith("/properties/suggestions/getAll");
      expect(result).toEqual(mockSuggestions);
    });

    it("debe manejar error al obtener sugerencias", async () => {
      const error = new Error("Server error");
      (api.get as any).mockRejectedValue(error);

      await expect(getAllSuggestions()).rejects.toThrow("Server error");
    });

    it("debe retornar array vacío si no hay sugerencias", async () => {
      (api.get as any).mockResolvedValue({ data: [] });

      const result = await getAllSuggestions();

      expect(result).toEqual([]);
    });
  });
});
