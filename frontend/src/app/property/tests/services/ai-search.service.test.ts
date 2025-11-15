import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchPropertiesWithAI } from "../../services/ai-search.service";
import { api } from "../../../../api";
import type { PropertySimple } from "../../types/property";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("ai-search.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPropertySimple: PropertySimple = {
    id: 1,
    title: "Casa en Centro",
    price: 100000,
    description: "Hermosa casa en el centro",
    date: "2024-01-01",
    mainImage: "https://example.com/image.jpg",
    status: "DISPONIBLE",
    operation: "VENTA",
    currency: "USD",
    neighborhood: "Centro",
    type: "Casa",
  };

  describe("searchPropertiesWithAI", () => {
    it("debe buscar propiedades con IA exitosamente", async () => {
      const query = "Casa de 3 dormitorios en zona norte";
      const mockResponse = [mockPropertySimple];

      (api.get as any).mockResolvedValue({ data: mockResponse });

      const result = await searchPropertiesWithAI(query);

      expect(api.get).toHaveBeenCalledWith("/properties/compare/search", {
        params: { query },
        withCredentials: true,
      });
      expect(result).toEqual(mockResponse);
    });

    it("debe retornar array vacío si no hay resultados", async () => {
      const query = "Propiedad inexistente";
      (api.get as any).mockResolvedValue({ data: [] });

      const result = await searchPropertiesWithAI(query);

      expect(api.get).toHaveBeenCalledWith("/properties/compare/search", {
        params: { query },
        withCredentials: true,
      });
      expect(result).toEqual([]);
    });

    it("debe manejar respuesta directa sin wrapper data", async () => {
      const query = "Departamento 2 ambientes";
      const mockResponse = [mockPropertySimple];

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await searchPropertiesWithAI(query);

      expect(result).toEqual(mockResponse);
    });

    it("debe propagar error si la llamada a la API falla", async () => {
      const query = "Casa con jardín";
      const mockError = new Error("Network error");

      (api.get as any).mockRejectedValue(mockError);

      await expect(searchPropertiesWithAI(query)).rejects.toThrow("Network error");
      expect(api.get).toHaveBeenCalledWith("/properties/compare/search", {
        params: { query },
        withCredentials: true,
      });
    });

    it("debe buscar con diferentes queries", async () => {
      const queries = [
        "Casa en barrio privado",
        "Departamento con pileta",
        "Local comercial céntrico",
      ];

      for (const query of queries) {
        (api.get as any).mockResolvedValue({ data: [] });
        await searchPropertiesWithAI(query);

        expect(api.get).toHaveBeenCalledWith("/properties/compare/search", {
          params: { query },
          withCredentials: true,
        });
      }
    });

    it("debe retornar múltiples propiedades", async () => {
      const query = "Propiedades en venta";
      const mockProperties = [
        mockPropertySimple,
        { ...mockPropertySimple, id: 2, title: "Otra propiedad" },
        { ...mockPropertySimple, id: 3, title: "Tercera propiedad" },
      ];

      (api.get as any).mockResolvedValue({ data: mockProperties });

      const result = await searchPropertiesWithAI(query);

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockProperties);
    });

    it("debe logear error en consola al fallar", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const query = "Test query";
      const mockError = new Error("API Error");

      (api.get as any).mockRejectedValue(mockError);

      try {
        await searchPropertiesWithAI(query);
      } catch (error) {
        // Expected error
      }

      expect(consoleSpy).toHaveBeenCalledWith("Error searching properties with AI:", mockError);
      consoleSpy.mockRestore();
    });
  });
});
