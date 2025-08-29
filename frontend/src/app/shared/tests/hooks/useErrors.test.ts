/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Mock } from "vitest";

const showAlertMock = vi.fn();
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({ showAlert: showAlertMock }),
}));

const extractApiErrorMock = vi.fn();
vi.mock("../../../shared/utils/error", () => ({
  extractApiError: (...args: any[]) => extractApiErrorMock(...args),
}));

import { useApiErrors } from "../../../shared/hooks/useErrors";

describe("useApiErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("estado inicial: error=null y handleError es función memoizada", () => {
    const { result, rerender } = renderHook(() => useApiErrors());
    expect(result.current.error).toBeNull();
    expect(typeof result.current.handleError).toBe("function");

    const firstRef = result.current.handleError;
    rerender();
    expect(result.current.handleError).toBe(firstRef);
  });

  it("handleError: extrae mensaje, setea error, muestra alerta y retorna el mensaje", () => {
    (extractApiErrorMock as Mock).mockReturnValueOnce("Boom!");

    const { result } = renderHook(() => useApiErrors());

    let ret: any;
    act(() => {
      ret = result.current.handleError({ code: 500, msg: "x" });
    });

    expect(extractApiErrorMock).toHaveBeenCalledWith({ code: 500, msg: "x" });
    expect(ret).toBe("Boom!");
    expect(result.current.error).toBe("Boom!");
    expect(showAlertMock).toHaveBeenCalledWith("Boom!", "error");
  });

  it("setError: permite modificar/limpiar el estado de error manualmente", () => {
    const { result } = renderHook(() => useApiErrors());

    act(() => {
      result.current.setError("Algo pasó");
    });
    expect(result.current.error).toBe("Algo pasó");

    act(() => {
      result.current.setError(null);
    });
    expect(result.current.error).toBeNull();
  });

  it("handleError funciona aunque extractApiError devuelva string vacío", () => {
    (extractApiErrorMock as Mock).mockReturnValueOnce("");

    const { result } = renderHook(() => useApiErrors());

    act(() => {
      result.current.handleError(new Error("sin mensaje util"));
    });

    expect(result.current.error).toBe("");
    expect(showAlertMock).toHaveBeenCalledWith("", "error");
  });
});
