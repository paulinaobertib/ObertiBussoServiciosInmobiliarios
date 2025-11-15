/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { Property, PropertySimple } from "../../types/property";

// Mock del servicio AI
const searchPropertiesWithAIMock = vi.fn();
vi.mock("../../services/ai-search.service", () => ({
  searchPropertiesWithAI: (...args: any[]) => searchPropertiesWithAIMock(...args),
}));

// Mock del servicio de propiedades
const getPropertyByIdMock = vi.fn();
vi.mock("../../services/property.service", () => ({
  getPropertyById: (...args: any[]) => getPropertyByIdMock(...args),
}));

// Mock del contexto de propiedades
let mockPropertiesList: Property[] | null = null;
const setPropertiesLoadingMock = vi.fn();

vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: () => ({
    propertiesList: mockPropertiesList,
    setPropertiesLoading: setPropertiesLoadingMock,
  }),
}));

// Importar el hook después de los mocks
import { useAISearch } from "../../hooks/useAISearch";

describe("useAISearch", () => {
  const mockPropertyFull: Property = {
    id: 1,
    title: "Casa en Centro",
    street: "Calle Falsa",
    number: "123",
    description: "Hermosa casa",
    status: "DISPONIBLE",
    operation: "VENTA",
    currency: "USD",
    rooms: 3,
    bathrooms: 2,
    bedrooms: 3,
    area: 120,
    coveredArea: 100,
    price: 100000,
    expenses: null,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: false,
    owner: { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123456789" },
    neighborhood: { id: 1, name: "Centro", city: "Ciudad X", type: "" },
    type: { id: 1, name: "Casa", hasBedrooms: true, hasBathrooms: true, hasRooms: true, hasCoveredArea: true },
    amenities: [],
    mainImage: "image.jpg",
    images: [],
    date: new Date().toISOString(),
  };

  const mockPropertySimple: PropertySimple = {
    id: 1,
    title: "Casa en Centro",
    price: 100000,
    description: "Hermosa casa",
    date: "2024-01-01",
    mainImage: "image.jpg",
    status: "DISPONIBLE",
    operation: "VENTA",
    currency: "USD",
    neighborhood: "Centro",
    type: "Casa",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPropertiesList = [mockPropertyFull];
    setPropertiesLoadingMock.mockImplementation(() => {});
  });

  describe("Estado inicial", () => {
    it("debe inicializar con valores por defecto", () => {
      const onResults = vi.fn();
      const { result } = renderHook(() => useAISearch({ onResults }));

      expect(result.current.isAIEnabled).toBe(false);
      expect(result.current.prompt).toBe("");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe("enableAI y disableAI", () => {
    it("debe habilitar la búsqueda con IA", () => {
      const onResults = vi.fn();
      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.enableAI();
      });

      expect(result.current.isAIEnabled).toBe(true);
    });

    it("debe deshabilitar la búsqueda con IA y limpiar estado", () => {
      const onResults = vi.fn();
      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.enableAI();
        result.current.setPrompt("Test query");
      });

      act(() => {
        result.current.disableAI();
      });

      expect(result.current.isAIEnabled).toBe(false);
      expect(result.current.prompt).toBe("");
      expect(result.current.error).toBe(null);
    });
  });

  describe("setPrompt", () => {
    it("debe actualizar el prompt", () => {
      const onResults = vi.fn();
      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Nueva búsqueda");
      });

      expect(result.current.prompt).toBe("Nueva búsqueda");
    });
  });

  describe("handleAISearch", () => {
    it("debe mostrar error si el prompt está vacío", async () => {
      const onResults = vi.fn();
      const { result } = renderHook(() => useAISearch({ onResults }));

      await act(async () => {
        await result.current.handleAISearch();
      });

      expect(result.current.error).toBe("Describe lo que estás buscando para usar la búsqueda con IA.");
      expect(searchPropertiesWithAIMock).not.toHaveBeenCalled();
    });

    it("debe realizar búsqueda exitosa con propiedades en cache", async () => {
      const onResults = vi.fn();
      searchPropertiesWithAIMock.mockResolvedValue([mockPropertySimple]);

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Casa en Centro");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        expect(searchPropertiesWithAIMock).toHaveBeenCalledWith("Casa en Centro");
        expect(onResults).toHaveBeenCalledWith([mockPropertyFull]);
        expect(result.current.error).toBe(null);
        expect(result.current.loading).toBe(false);
      });
    });

    it("debe buscar propiedades faltantes desde el servicio", async () => {
      const onResults = vi.fn();
      const newPropertySimple: PropertySimple = { ...mockPropertySimple, id: 2, title: "Nueva Casa" };
      const newPropertyFull: Property = { ...mockPropertyFull, id: 2, title: "Nueva Casa" };

      searchPropertiesWithAIMock.mockResolvedValue([mockPropertySimple, newPropertySimple]);
      getPropertyByIdMock.mockResolvedValue(newPropertyFull);

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Casas en venta");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        expect(getPropertyByIdMock).toHaveBeenCalledWith(2);
        expect(onResults).toHaveBeenCalledWith([mockPropertyFull, newPropertyFull]);
      });
    });

    it("debe manejar resultados vacíos", async () => {
      const onResults = vi.fn();
      searchPropertiesWithAIMock.mockResolvedValue([]);

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Propiedad inexistente");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        expect(onResults).toHaveBeenCalledWith([]);
        expect(result.current.loading).toBe(false);
      });
    });

    it("debe manejar errores de la búsqueda con IA", async () => {
      const onResults = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      searchPropertiesWithAIMock.mockRejectedValue(new Error("AI service error"));

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Test query");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        expect(result.current.error).toBe("No pudimos completar la búsqueda con IA. Intentá nuevamente.");
        expect(onResults).toHaveBeenCalledWith([]);
        expect(result.current.loading).toBe(false);
      });

      consoleErrorSpy.mockRestore();
    });

    it("debe manejar error al obtener propiedades faltantes", async () => {
      const onResults = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const newPropertySimple: PropertySimple = { ...mockPropertySimple, id: 2 };

      searchPropertiesWithAIMock.mockResolvedValue([newPropertySimple]);
      getPropertyByIdMock.mockRejectedValue(new Error("Fetch error"));

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Test");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        expect(onResults).toHaveBeenCalledWith([]);
      });

      consoleErrorSpy.mockRestore();
    });

    it("debe activar y desactivar loading durante la búsqueda", async () => {
      const onResults = vi.fn();
      searchPropertiesWithAIMock.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Test");
      });

      let loadingDuringSearch = false;

      act(() => {
        result.current.handleAISearch().then(() => {});
      });

      await waitFor(() => {
        if (result.current.loading) {
          loadingDuringSearch = true;
        }
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(loadingDuringSearch).toBe(true);
      expect(setPropertiesLoadingMock).toHaveBeenCalledWith(true);
      expect(setPropertiesLoadingMock).toHaveBeenCalledWith(false);
    });

    it("debe limpiar espacios en blanco del prompt", async () => {
      const onResults = vi.fn();
      searchPropertiesWithAIMock.mockResolvedValue([]);

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("  Casa en Centro  ");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        expect(searchPropertiesWithAIMock).toHaveBeenCalledWith("Casa en Centro");
      });
    });
  });

  describe("handleKeyDown", () => {
    it("debe ejecutar búsqueda al presionar Enter", async () => {
      const onResults = vi.fn();
      searchPropertiesWithAIMock.mockResolvedValue([]);

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Test");
      });

      const mockEvent = {
        key: "Enter",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as any;

      await act(async () => {
        result.current.handleKeyDown(mockEvent);
      });

      await waitFor(() => {
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(searchPropertiesWithAIMock).toHaveBeenCalled();
      });
    });

    it("no debe ejecutar búsqueda con Shift+Enter", () => {
      const onResults = vi.fn();
      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Test");
      });

      const mockEvent = {
        key: "Enter",
        shiftKey: true,
        preventDefault: vi.fn(),
      } as any;

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(searchPropertiesWithAIMock).not.toHaveBeenCalled();
    });

    it("no debe hacer nada con otras teclas", () => {
      const onResults = vi.fn();
      const { result } = renderHook(() => useAISearch({ onResults }));

      const mockEvent = {
        key: "A",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as any;

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(searchPropertiesWithAIMock).not.toHaveBeenCalled();
    });
  });

  describe("resolveFullProperties", () => {
    it("debe resolver propiedades desde cache local", async () => {
      const onResults = vi.fn();
      mockPropertiesList = [mockPropertyFull];
      searchPropertiesWithAIMock.mockResolvedValue([mockPropertySimple]);

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Test");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        expect(getPropertyByIdMock).not.toHaveBeenCalled();
        expect(onResults).toHaveBeenCalledWith([mockPropertyFull]);
      });
    });

    it("debe filtrar propiedades que no se pudieron obtener", async () => {
      const onResults = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockPropertiesList = [];

      const simple1: PropertySimple = { ...mockPropertySimple, id: 1 };
      const simple2: PropertySimple = { ...mockPropertySimple, id: 2 };
      const simple3: PropertySimple = { ...mockPropertySimple, id: 3 };

      searchPropertiesWithAIMock.mockResolvedValue([simple1, simple2, simple3]);
      
      getPropertyByIdMock.mockImplementation((id: number) => {
        if (id === 1) return Promise.resolve({ ...mockPropertyFull, id: 1 });
        if (id === 2) return Promise.reject(new Error("Not found"));
        if (id === 3) return Promise.resolve({ ...mockPropertyFull, id: 3 });
      });

      const { result } = renderHook(() => useAISearch({ onResults }));

      act(() => {
        result.current.setPrompt("Test");
      });

      await act(async () => {
        await result.current.handleAISearch();
      });

      await waitFor(() => {
        const resultProperties = onResults.mock.calls[0][0] as Property[];
        expect(resultProperties).toHaveLength(2);
        expect(resultProperties.map((p) => p.id)).toEqual([1, 3]);
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
