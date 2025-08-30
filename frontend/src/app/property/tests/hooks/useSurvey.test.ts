/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";

// --- Mocks con RUTAS CORRECTAS ---
const createSurveyMock = vi.fn();
vi.mock("../../services/survey.service", () => ({
  createSurvey: (...args: any[]) => createSurveyMock(...args),
}));

const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

import { useSurvey } from "../../hooks/useSurvey";

describe("useSurvey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("estado inicial: loading=false", () => {
    const { result } = renderHook(() => useSurvey());
    expect(result.current.loading).toBe(false);
  });

  it("postSurvey: muestra loading intermedio y retorna el resultado (promesa controlada)", async () => {
    // Promesa controlada para poder asertar loading=true antes de resolver
    let resolveFn!: (v: any) => void;
    (createSurveyMock as Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve;
        })
    );

    const { result } = renderHook(() => useSurvey());

    const dto = { q1: "a", q2: "b" } as any;
    const token = "tok_test";

    let retPromise!: Promise<any>;
    await act(async () => {
      retPromise = result.current.postSurvey(dto, token) as Promise<any>;
      // microtick para aplicar setState
      await Promise.resolve();
    });

    // loading intermedio
    expect(result.current.loading).toBe(true);
    // argumentos correctos al servicio
    expect(createSurveyMock).toHaveBeenCalledWith(dto, token);

    // resolvemos la promesa del servicio
    await act(async () => {
      resolveFn("OK_RESULT");
      const ret = await retPromise;
      expect(ret).toBe("OK_RESULT");
    });

    // vuelve a false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("postSurvey: éxito simple (resolved) y devuelve lo que responde el servicio", async () => {
    (createSurveyMock as Mock).mockResolvedValueOnce({ status: 201, id: 9 });

    const { result } = renderHook(() => useSurvey());

    let out: any;
    await act(async () => {
      out = await result.current.postSurvey({ any: "dto" } as any, "tkn");
    });

    expect(createSurveyMock).toHaveBeenCalledWith({ any: "dto" }, "tkn");
    expect(out).toEqual({ status: 201, id: 9 });
    expect(result.current.loading).toBe(false);
  });

  it("postSurvey: error → llama handleError, retorna undefined y resetea loading", async () => {
    const boom = new Error("survey fail");
    (createSurveyMock as Mock).mockRejectedValueOnce(boom);

    const { result } = renderHook(() => useSurvey());

    let out: any;
    await act(async () => {
      out = await result.current.postSurvey({} as any, "bad");
    });

    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(out).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });
});
