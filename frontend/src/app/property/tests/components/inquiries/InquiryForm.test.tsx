/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { InquiryForm } from "../../../components/inquiries/InquiryForm";

// Mock del hook
vi.mock("../../../hooks/useInquiryForm", () => ({
  useInquiryForm: vi.fn(),
}));

import { useInquiryForm } from "../../../hooks/useInquiryForm";

describe("InquiryForm", () => {
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn((e?: any) => e?.preventDefault());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMock = (overrides: any = {}) => {
    (useInquiryForm as unknown as Mock).mockReturnValue({
      form: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        description: "",
        ...overrides.form,
      },
      formLoading: false,
      formError: null,
      submitted: false,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
      ...overrides,
    });
  };

  it("renderiza el formulario con campos vacíos", () => {
    setupMock();
    render(<InquiryForm propertyIds={[1, 2]} />);

    expect(screen.getByRole("textbox", { name: /Nombre/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Apellido/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Email/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Teléfono/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Descripción de la consulta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Consulta/i })).toBeInTheDocument();
  });

  it("ejecuta handleChange al modificar un campo", () => {
    setupMock();
    render(<InquiryForm />);
    const input = screen.getByRole("textbox", { name: /Nombre/i });

    fireEvent.change(input, { target: { value: "Juan" } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it("muestra error cuando formError está presente", () => {
    setupMock({ formError: "Error en el envío" });
    render(<InquiryForm />);
    expect(screen.getByText("Error en el envío")).toBeInTheDocument();
  });

  it("muestra el botón en estado loading cuando formLoading es true", () => {
    setupMock({ formLoading: true });
    render(<InquiryForm />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Enviando…")).toBeInTheDocument();
  });

  it("ejecuta handleSubmit al enviar el formulario", () => {
    setupMock();
    const { container } = render(<InquiryForm />);
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("muestra mensaje de éxito cuando submitted es true", () => {
    setupMock({ submitted: true });
    render(<InquiryForm />);
    expect(screen.getByText("¡Consulta enviada!")).toBeInTheDocument();
    expect(screen.getByText("Gracias. Te avisaremos en cuanto tengamos una respuesta.")).toBeInTheDocument();
  });
});
