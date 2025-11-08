/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// ---- Mocks dinámicos del contexto ----
type Property = any;

let currentList: Property[] | null = null;
const refreshPropertiesMock = vi.fn(() => Promise.resolve());

vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: () => ({
    propertiesList: currentList as any,
    refreshProperties: refreshPropertiesMock,
  }),
}));

// ---- Mock de errores ----
const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

// ---- Mock de AlertContext ----
let mockAlert: any = {};
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlert,
}));

// ---- Import del hook bajo test (después de los mocks) ----
import { usePropertyPanel } from "../../hooks/usePropertySection";

describe("usePropertyPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentList = null; // por defecto, sin datos aún
    mockAlert = {}; // limpiar alertApi mock
  });

  it("estado inicial: loading=false y data vacía", () => {
    const { result } = renderHook(() => usePropertyPanel());

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it("al montar llama refreshProperties; luego termina con loading=false (éxito)", async () => {
    // promesa controlada para el refresh
    let resolveRefresh!: () => void;
    const p = new Promise<void>((res) => (resolveRefresh = res));
    refreshPropertiesMock.mockReturnValueOnce(p);

    const { result } = renderHook(() => usePropertyPanel());

    // Se invoca el refresh al montar
    expect(refreshPropertiesMock).toHaveBeenCalledTimes(1);

    // simulamos que el backend luego publica lista -> cambia el contexto
    currentList = [{ id: 1, title: "A" } as any];
    // resolvemos el refresh
    await act(async () => {
      resolveRefresh();
      await p;
    });

    // esperamos que baje el loading
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("si refreshProperties lanza error: llama handleError y deja loading=false", async () => {
    const boom = new Error("fail refresh");
    refreshPropertiesMock.mockRejectedValueOnce(boom);

    renderHook(() => usePropertyPanel());

    // esperamos a que caiga el catch y finalice el effect
    await waitFor(() => {
      expect(handleErrorMock).toHaveBeenCalledWith(boom);
    });
  });

  it("cuando cambia propertiesList en el contexto, actualiza data y fuerza loading=false", async () => {
    refreshPropertiesMock.mockResolvedValueOnce(undefined);

    const { result, rerender } = renderHook(() => usePropertyPanel());

    // Cambiamos la lista "desde el contexto" y forzamos un rerender
    currentList = [{ id: 10, title: "X" } as any, { id: 11, title: "Y" } as any];
    rerender();

    expect(result.current.data).toEqual([
      { id: 10, title: "X" },
      { id: 11, title: "Y" },
    ]);
    expect(result.current.loading).toBe(false);
  });

  it("onSearch: reemplaza data con los resultados recibidos", () => {
    const { result } = renderHook(() => usePropertyPanel());

    const results = [{ id: 99, title: "Filtro OK" } as any];

    act(() => {
      result.current.onSearch(results);
    });

    expect(result.current.data).toEqual(results);
  });

  it("toggleSelect e isSelected: selecciona y des-selecciona por id", () => {
    const { result } = renderHook(() => usePropertyPanel());

    // inicialmente nada seleccionado
    expect(result.current.isSelected(5)).toBe(false);

    act(() => {
      result.current.toggleSelect(5);
    });
    expect(result.current.isSelected(5)).toBe(true);

    // toggle mismo id -> des-selecciona
    act(() => {
      result.current.toggleSelect(5);
    });
    expect(result.current.isSelected(5)).toBe(false);

    // seleccionar otro id
    act(() => {
      result.current.toggleSelect(7);
    });
    expect(result.current.isSelected(7)).toBe(true);
    expect(result.current.isSelected(5)).toBe(false);
  });
});
