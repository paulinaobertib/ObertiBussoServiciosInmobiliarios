import { renderHook, waitFor } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useSuggestions } from "../../hooks/useSuggestions";
import { getAllSuggestions } from "../../services/suggestion.service";
import { useApiErrors } from "../../../shared/hooks/useErrors";

vi.mock("../../services/suggestion.service");
vi.mock("../../../shared/hooks/useErrors", () => ({ useApiErrors: vi.fn() }));

describe("useSuggestions", () => {
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useApiErrors as unknown as Mock).mockReturnValue({ handleError: mockHandleError });
  });

  it("obtiene las sugerencias al montar y actualiza el estado", async () => {
    const fakeSuggestions = [
      { id: 1, description: "Primera sugerencia", date: "2024-01-01T10:00:00Z" },
      { id: 2, description: "Segunda sugerencia", date: "2024-02-02T12:00:00Z" },
    ];
    vi.mocked(getAllSuggestions).mockResolvedValue(fakeSuggestions as any);

    const { result } = renderHook(() => useSuggestions());

    expect(result.current.loading).toBe(true);
    expect(getAllSuggestions).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestions).toEqual(fakeSuggestions);
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it("maneja errores al traer las sugerencias", async () => {
    const error = new Error("error fetching");
    vi.mocked(getAllSuggestions).mockRejectedValue(error);

    const { result } = renderHook(() => useSuggestions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestions).toEqual([]);
    expect(mockHandleError).toHaveBeenCalledWith(error);
  });
});
