import { render, screen, fireEvent } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { SuggestionForm } from "../../../../property/components/suggestions/SuggestionForm";
import { useSuggestionForm } from "../../../../property/hooks/useSuggestionForm";

vi.mock("../../../../property/hooks/useSuggestionForm");

describe("SuggestionForm component", () => {
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn((event?: any) => event?.preventDefault?.());

  beforeEach(() => {
    vi.clearAllMocks();
    (useSuggestionForm as unknown as Mock).mockReturnValue({
      form: { description: "Texto inicial" },
      formLoading: false,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
  });

  it("muestra el valor actual del formulario", () => {
    render(<SuggestionForm />);

    expect(screen.getByRole("textbox")).toHaveValue("Texto inicial");
  });

  it("llama a handleChange al editar la descripción", () => {
    render(<SuggestionForm />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Nueva idea" } });

    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  it("ejecuta handleSubmit al enviar el formulario", () => {
    render(<SuggestionForm />);

    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.submit(form);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("deshabilita el botón cuando está cargando", () => {
    (useSuggestionForm as unknown as Mock).mockReturnValue({
      form: { description: "" },
      formLoading: true,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });

    render(<SuggestionForm />);

    const button = screen.getByRole("button", { name: /Enviar Sugerencia de Mejora/i });
    expect(button).toBeDisabled();
  });
});
