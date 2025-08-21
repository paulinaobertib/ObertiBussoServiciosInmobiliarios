// src/app/property/tests/hooks/useSurvey.test.ts
import { renderHook, act } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { useSurvey } from "../../hooks/useSurvey";
import { createSurvey } from "../../services/survey.service";
import { CreateSurveyDTO } from "../../types/survey";

// ─── Mock del servicio ───
vi.mock("../../services/survey.service", () => ({
  createSurvey: vi.fn(),
}));

describe("useSurvey hook", () => {
  const mockCreateSurvey = createSurvey as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa correctamente", () => {
    const { result } = renderHook(() => useSurvey());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.postSurvey).toBe("function");
  });

  it("ejecuta postSurvey correctamente y retorna datos", async () => {
    const fakeResponse = { id: 1, score: 5, comment: "Good", inquiryId: 10 };
    mockCreateSurvey.mockResolvedValueOnce(fakeResponse);

    const { result } = renderHook(() => useSurvey());

    const data: CreateSurveyDTO = {
      score: 5,
      comment: "Good",
      inquiryId: 10,
    };

    let response;
    await act(async () => {
      response = await result.current.postSurvey(data, "token123");
    });

    expect(mockCreateSurvey).toHaveBeenCalledWith(data, "token123");
    expect(response).toEqual(fakeResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("maneja errores en postSurvey", async () => {
    const fakeError = { response: { data: "Error en servidor" } };
    mockCreateSurvey.mockRejectedValueOnce(fakeError);

    const { result } = renderHook(() => useSurvey());

    const data: CreateSurveyDTO = {
      score: 3,
      comment: "Bad",
      inquiryId: 11,
    };

    await act(async () => {
      await expect(result.current.postSurvey(data, "token123")).rejects.toEqual(
        fakeError
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Error en servidor");
  });

  it("maneja errores desconocidos en postSurvey", async () => {
    mockCreateSurvey.mockRejectedValueOnce({});

    const { result } = renderHook(() => useSurvey());

    const data: CreateSurveyDTO = {
      score: 2,
      comment: "Fail",
      inquiryId: 12,
    };

    await act(async () => {
      await expect(result.current.postSurvey(data, "token123")).rejects.toEqual(
        {}
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Error desconocido");
  });
});
