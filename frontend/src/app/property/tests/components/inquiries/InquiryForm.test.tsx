/// <reference types="vitest" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ---------- Mock del hook ----------
const useInquiryFormMock = vi.fn();
vi.mock("../../../hooks/useInquiryForm", () => ({
  useInquiryForm: (...args: any[]) => useInquiryFormMock(...args),
}));

// ---------- SUT ----------
import { InquiryForm } from "../../../components/inquiries/InquiryForm";

function baseState() {
  return {
    form: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      description: "",
    },
    formLoading: false,
    handleChange: vi.fn((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => e),
    handleSubmit: vi.fn((e: React.FormEvent) => {
      e?.preventDefault?.();
    }),
  };
}
const makeHookState = (over: Partial<ReturnType<typeof baseState>> = {}) => ({
  ...baseState(),
  ...over,
});

describe("<InquiryForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useInquiryFormMock.mockReset();
  });

  it("pasa propertyIds al hook y renderiza todos los campos", () => {
    const hookState = makeHookState();
    useInquiryFormMock.mockReturnValue(hookState);

    render(<InquiryForm propertyIds={[10, 20]} />);

    expect(useInquiryFormMock).toHaveBeenCalledWith({ propertyIds: [10, 20] });

    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción de la consulta/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Consulta/i })).toBeInTheDocument();
  });

  it("propaga onChange de cada campo (verifica name + llamada)", () => {
    const hookState = makeHookState();
    useInquiryFormMock.mockReturnValue(hookState);

    render(<InquiryForm />);

    const changeAndCheck = (label: RegExp, name: string, value: string) => {
      const el = screen.getByLabelText(label);
      fireEvent.change(el, { target: { value } });
      expect(hookState.handleChange).toHaveBeenCalled();
      const evt = (hookState.handleChange as any).mock.calls.at(-1)?.[0];
      expect((evt?.target as HTMLInputElement).name).toBe(name);
    };

    changeAndCheck(/Nombre/i, "firstName", "Ana");
    changeAndCheck(/Apellido/i, "lastName", "Pérez");
    changeAndCheck(/Email/i, "email", "ana@test.com");
    changeAndCheck(/Teléfono/i, "phone", "123456");
    changeAndCheck(/Descripción de la consulta/i, "description", "Quiero info");
  });

  it("submit del formulario llama handleSubmit (disparando el submit del <form>)", () => {
    const hookState = makeHookState();
    useInquiryFormMock.mockReturnValue(hookState);

    const { container } = render(<InquiryForm />);
    const form = container.querySelector("form")!;
    expect(form).toBeTruthy();

    fireEvent.submit(form);
    expect(hookState.handleSubmit).toHaveBeenCalled();
  });

  it("cuando formLoading=true el botón está deshabilitado", () => {
    const hookState = makeHookState({ formLoading: true });
    useInquiryFormMock.mockReturnValue(hookState);

    render(<InquiryForm />);
    const btn = screen.getByRole("button", { name: /Enviar Consulta/i });
    expect(btn).toBeDisabled();
  });

  it("renderiza valores iniciales en inputs (controlado por el hook)", () => {
    const hookState = makeHookState({
      form: {
        firstName: "Luis",
        lastName: "García",
        email: "luis@test.com",
        phone: "555-123",
        description: "Consulta previa",
      },
    });
    useInquiryFormMock.mockReturnValue(hookState);

    render(<InquiryForm />);
    expect(screen.getByLabelText(/Nombre/i)).toHaveValue("Luis");
    expect(screen.getByLabelText(/Apellido/i)).toHaveValue("García");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("luis@test.com");
    expect(screen.getByLabelText(/Teléfono/i)).toHaveValue("555-123");
    expect(screen.getByLabelText(/Descripción de la consulta/i)).toHaveValue("Consulta previa");
  });
});
