import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLoading } from "../../utils/useLoading";

describe("useLoading", () => {
  it("debe inicializar con loading en false", () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() => useLoading(mockFn));

    expect(result.current.loading).toBe(false);
  });

  it("debe establecer loading en true durante la ejecución", async () => {
    const mockFn = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("success"), 50)));
    const { result } = renderHook(() => useLoading(mockFn));

    let loadingDuringExecution = false;

    act(() => {
      result.current.run();
    });

    // Verificar que esté en loading durante la ejecución
    await waitFor(() => {
      if (result.current.loading) {
        loadingDuringExecution = true;
      }
    });

    expect(loadingDuringExecution).toBe(true);
  });

  it("debe establecer loading en false después de completar", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() => useLoading(mockFn));

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.loading).toBe(false);
  });

  it("debe ejecutar la función y retornar el resultado", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() => useLoading(mockFn));

    let returnValue;
    await act(async () => {
      returnValue = await result.current.run();
    });

    expect(mockFn).toHaveBeenCalled();
    expect(returnValue).toBe("success");
  });

  it("debe pasar argumentos a la función", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() => useLoading(mockFn));

    await act(async () => {
      await result.current.run("arg1", "arg2");
    });

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("debe establecer loading en false incluso si la función falla", async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useLoading(mockFn));

    await act(async () => {
      try {
        await result.current.run();
      } catch {
        // Ignorar error
      }
    });

    expect(result.current.loading).toBe(false);
  });
});
