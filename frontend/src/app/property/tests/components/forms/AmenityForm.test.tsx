/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../../context/PropertiesContext", () => ({
  usePropertiesContext: vi.fn(() => ({ refreshAmenities: vi.fn() })),
}));

vi.mock("../../../hooks/useCategories", () => ({
  useCategories: vi.fn(),
}));

import { AmenityForm } from "../../../components/forms/AmenityForm";

const { useCategories } = await import("../../../hooks/useCategories");

describe("<AmenityForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el TextField con el nombre inicial y permite editar cuando action='add'", () => {
    const setForm = vi.fn();

    (useCategories as any).mockReturnValue({
      form: { id: 0, name: "Inicial" },
      setForm,
      invalid: false,
      run: vi.fn(),
      loading: false,
    });

    render(<AmenityForm action="add" onDone={() => {}} />);

    const input = screen.getByLabelText(/Nombre/i) as HTMLInputElement;
    expect(input.value).toBe("Inicial");
    expect(input).not.toBeDisabled();

    fireEvent.change(input, { target: { value: "Actualizado" } });
    expect(setForm).toHaveBeenCalledWith({ id: 0, name: "Actualizado" });
  });

  it("muestra botón 'Eliminar' y deshabilita el TextField cuando action='delete'", () => {
    (useCategories as any).mockReturnValue({
      form: { id: 5, name: "Parrilla" },
      setForm: vi.fn(),
      invalid: false,
      run: vi.fn(),
      loading: false,
    });

    render(<AmenityForm action="delete" item={{ id: 5, name: "Parrilla" } as any} onDone={() => {}} />);

    const input = screen.getByLabelText(/Nombre/i);
    expect(input).toBeDisabled();

    // texto del botón
    expect(screen.getByRole("button", { name: /Eliminar/i })).toBeInTheDocument();
  });

  it("deshabilita el botón cuando invalid=true", () => {
    (useCategories as any).mockReturnValue({
      form: { id: 0, name: "" },
      setForm: vi.fn(),
      invalid: true,
      run: vi.fn(),
      loading: false,
    });

    render(<AmenityForm action="add" onDone={() => {}} />);
    const btn = screen.getByRole("button", { name: /Confirmar/i });
    expect(btn).toBeDisabled();
  });

  it("al hacer click en 'Confirmar' llama a run() cuando no está invalid ni loading", () => {
    const run = vi.fn();

    (useCategories as any).mockReturnValue({
      form: { id: 0, name: "Gimnasio" },
      setForm: vi.fn(),
      invalid: false,
      run,
      loading: false,
    });

    render(<AmenityForm action="add" onDone={() => {}} />);

    const btn = screen.getByRole("button", { name: /Confirmar/i });
    fireEvent.click(btn);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("muestra un indicador de carga cuando loading=true", () => {
    (useCategories as any).mockReturnValue({
      form: { id: 0, name: "Sauna" },
      setForm: vi.fn(),
      invalid: false,
      run: vi.fn(),
      loading: true,
    });

    render(<AmenityForm action="edit" onDone={() => {}} />);

    // LoadingButton renderiza un progress con role="progressbar"
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
