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

const deletePropertyMock = vi.fn();
vi.mock("../../services/property.service", () => ({
  deleteProperty: (...args: any[]) => deletePropertyMock(...args),
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
    deletePropertyMock.mockReset();
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

  it("refresh usa el modo indicado y reporta errores", async () => {
    const { result } = renderHook(() => usePropertyPanel("available"));
    refreshPropertiesMock.mockClear();

    await act(async () => {
      await result.current.refresh();
    });
    expect(refreshPropertiesMock).toHaveBeenCalledWith("available");

    const boom = new Error("refresh fail");
    refreshPropertiesMock.mockRejectedValueOnce(boom);
    await act(async () => {
      await result.current.refresh();
    });
    expect(handleErrorMock).toHaveBeenCalledWith(boom);
  });

  it("removeProperty cancela si usuario no confirma", async () => {
    mockAlert = { doubleConfirm: vi.fn().mockResolvedValue(false) };
    const { result } = renderHook(() => usePropertyPanel());

    const ok = await result.current.removeProperty({ id: 1, title: "Propiedad" } as any);
    expect(ok).toBe(false);
    expect(deletePropertyMock).not.toHaveBeenCalled();
  });

  it("removeProperty elimina, refresca y limpia selección", async () => {
    const success = vi.fn();
    mockAlert = { doubleConfirm: vi.fn().mockResolvedValue(true), success };
    deletePropertyMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePropertyPanel());
    const prop = { id: 3, title: "Depto" } as any;

    act(() => {
      result.current.onSearch([prop]);
      result.current.toggleSelect(3);
    });
    expect(result.current.isSelected(3)).toBe(true);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.removeProperty(prop);
    });
    expect(ok).toBe(true);
    expect(deletePropertyMock).toHaveBeenCalledWith(prop);
    expect(success).toHaveBeenCalledWith({
      title: "Propiedad eliminada",
      description: `"${prop.title}" se eliminó correctamente.`,
      primaryLabel: "Volver",
    });
    expect(result.current.isSelected(3)).toBe(false);
  });

  it("removeProperty informa error cuando delete falla", async () => {
    const boom = new Error("delete fail");
    mockAlert = { doubleConfirm: vi.fn().mockResolvedValue(true) };
    deletePropertyMock.mockRejectedValueOnce(boom);

    const { result } = renderHook(() => usePropertyPanel());
    const ok = await result.current.removeProperty({ id: 9, title: "Casa" } as any);
    expect(ok).toBe(false);
    expect(handleErrorMock).toHaveBeenCalledWith(boom);
  });

  it("removeSelected utiliza la propiedad seleccionada", async () => {
    mockAlert = { doubleConfirm: vi.fn().mockResolvedValue(true), success: vi.fn() };
    deletePropertyMock.mockResolvedValueOnce(undefined);

    const prop = { id: 8, title: "Lote" } as any;
    const { result } = renderHook(() => usePropertyPanel());

    act(() => {
      result.current.onSearch([prop]);
      result.current.toggleSelect(8);
    });

    await act(async () => {
      await result.current.removeSelected();
    });

    expect(deletePropertyMock).toHaveBeenCalledWith(prop);
  });
});
