/// <reference types="vitest" />
import { renderHook, act } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useComparerProperty } from "../../../property/hooks/useComparer";
import { comparerProperty } from "../../services/comparer.service";

// ---- Mock del servicio ----
vi.mock("../../services/comparer.service", () => ({
  comparerProperty: vi.fn(),
}));

describe("useComparerProperty", () => {
  const mockData = [
    { id: 1, title: "Prop 1" },
    { id: 2, title: "Prop 2" },
  ] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compara propiedades con éxito", async () => {
    (comparerProperty as Mock).mockResolvedValue("Resultado Comparación");

    const { result } = renderHook(() => useComparerProperty());

    await act(async () => {
      await result.current.compare(mockData);
    });

    expect(comparerProperty).toHaveBeenCalledWith(mockData);
    expect(result.current.result).toBe("Resultado Comparación");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("maneja error en la comparación", async () => {
    (comparerProperty as Mock).mockRejectedValue({ response: { data: "Error del servidor" } });

    const { result } = renderHook(() => useComparerProperty());

    await act(async () => {
      await result.current.compare(mockData);
    });

    expect(result.current.error).toBe("Error del servidor");
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
  });

  it("cambia el estado de loading mientras compara", async () => {
    let resolveFn: any;
    (comparerProperty as Mock).mockImplementation(
      () => new Promise((res) => { resolveFn = res; })
    );

    const { result } = renderHook(() => useComparerProperty());

    // Ejecutamos compare, loading debe ser true inmediatamente
    act(() => {
      result.current.compare(mockData);
    });
    expect(result.current.loading).toBe(true);

    // Resolvemos la promesa para finalizar
    await act(async () => {
      resolveFn("OK");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBe("OK");
  });
});
