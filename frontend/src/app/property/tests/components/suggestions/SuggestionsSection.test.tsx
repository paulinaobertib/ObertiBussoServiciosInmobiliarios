import { render, screen } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { SuggestionsSection } from "../../../../property/components/suggestions/SuggestionsSection";
import { useSuggestions } from "../../../../property/hooks/useSuggestions";

vi.mock("../../../../property/hooks/useSuggestions");

describe("SuggestionsSection component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra un loader mientras carga", () => {
    (useSuggestions as unknown as Mock).mockReturnValue({
      suggestions: [],
      loading: true,
    });

    render(<SuggestionsSection />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay sugerencias", () => {
    (useSuggestions as unknown as Mock).mockReturnValue({
      suggestions: [],
      loading: false,
    });

    render(<SuggestionsSection />);

    expect(screen.getByText("No hay sugerencias registradas")).toBeInTheDocument();
  });

  it("ordena y renderiza las sugerencias recibidas", () => {
    (useSuggestions as unknown as Mock).mockReturnValue({
      suggestions: [
        { id: 1, description: "Sugerencia antigua", date: "2023-01-01T10:00:00Z" },
        { id: 2, description: "Sugerencia reciente", date: "2024-05-01T12:00:00Z" },
      ],
      loading: false,
    });

    render(<SuggestionsSection />);

    const chips = screen.getAllByText(/Sugerencia #/i);
    expect(chips[0]).toHaveTextContent("Sugerencia #2");
    expect(chips[1]).toHaveTextContent("Sugerencia #1");
    expect(screen.getByText("Sugerencia reciente")).toBeInTheDocument();
  });
});
