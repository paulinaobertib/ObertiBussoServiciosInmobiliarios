import { renderHook, act } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useSuggestionForm } from "../../hooks/useSuggestionForm";
import { postSuggestion } from "../../services/suggestion.service";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

vi.mock("../../services/suggestion.service");
vi.mock("../../../shared/hooks/useErrors", () => ({ useApiErrors: vi.fn() }));
vi.mock("../../../shared/context/AlertContext", () => ({ useGlobalAlert: vi.fn() }));

describe("useSuggestionForm", () => {
  const mockHandleError = vi.fn();
  const mockSuccessAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSuccessAlert.mockResolvedValue(undefined);
    (useApiErrors as unknown as Mock).mockReturnValue({ handleError: mockHandleError });
    (useGlobalAlert as unknown as Mock).mockReturnValue({ success: mockSuccessAlert });
  });

  it("inicializa el formulario vacío", () => {
    const { result } = renderHook(() => useSuggestionForm());

    expect(result.current.form).toEqual({ description: "" });
    expect(result.current.formLoading).toBe(false);
  });

  it("actualiza el formulario con handleChange", () => {
    const { result } = renderHook(() => useSuggestionForm());

    act(() => {
      result.current.handleChange({ target: { name: "description", value: "Nueva sugerencia" } } as any);
    });

    expect(result.current.form.description).toBe("Nueva sugerencia");
  });

  it("envía la sugerencia y resetea el formulario", async () => {
    const onSuccess = vi.fn();
    vi.mocked(postSuggestion).mockResolvedValue({} as any);

    const { result } = renderHook(() => useSuggestionForm({ onSuccess }));

    act(() => {
      result.current.handleChange({ target: { name: "description", value: "Idea de mejora" } } as any);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });

    expect(postSuggestion).toHaveBeenCalledWith({ description: "Idea de mejora" });
    expect(onSuccess).toHaveBeenCalled();
    expect(mockSuccessAlert).toHaveBeenCalled();
    expect(result.current.form.description).toBe("");
    expect(result.current.formLoading).toBe(false);
  });

  it("maneja errores al enviar la sugerencia", async () => {
    const error = new Error("fail");
    vi.mocked(postSuggestion).mockRejectedValue(error);

    const { result } = renderHook(() => useSuggestionForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error);
    expect(result.current.formLoading).toBe(false);
  });
});
