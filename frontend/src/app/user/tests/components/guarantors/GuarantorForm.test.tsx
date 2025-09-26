/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GuarantorForm from "../../../components/guarantors/GuarantorForm";

// --- Mock del hook useGuarantors ---
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockRemove = vi.fn();

vi.mock("../../../hooks/useGuarantors", () => ({
  useGuarantors: () => ({
    create: mockCreate,
    update: mockUpdate,
    remove: mockRemove,
  }),
}));

// --- Mock de alertas (aunque no se usa en el form, lo dejamos por compatibilidad) ---
const mockAlert = {
  showAlert: vi.fn(),
};
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlert,
}));

describe("GuarantorForm", () => {
  const baseProps = {
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea garante exitosamente", async () => {
    mockCreate.mockResolvedValueOnce(true);

    render(<GuarantorForm action="add" {...baseProps} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), "Juan");
    await userEvent.type(screen.getByLabelText(/email/i), "juan@mail.com");
    await userEvent.type(screen.getByLabelText(/teléfono/i), "1234567890");

    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: "Juan",
        email: "juan@mail.com",
        phone: "1234567890",
      });
    });

    expect(baseProps.onSuccess).toHaveBeenCalled();
  });

  it("edita garante exitosamente", async () => {
    mockUpdate.mockResolvedValueOnce(true);
    const item = { id: 1, name: "Pepe", email: "pepe@mail.com", phone: "1234567890" };

    render(<GuarantorForm action="edit" item={item} {...baseProps} />);

    await userEvent.clear(screen.getByLabelText(/nombre/i));
    await userEvent.type(screen.getByLabelText(/nombre/i), "Pepe Modificado");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(1, {
        name: "Pepe Modificado",
        email: "pepe@mail.com",
        phone: "1234567890",
      });
    });

    expect(baseProps.onSuccess).toHaveBeenCalled();
  });

  it("elimina garante exitosamente", async () => {
    mockRemove.mockResolvedValueOnce(true);
    const item = { id: 2, name: "Ana", email: "ana@mail.com", phone: "1234567890" };

    render(<GuarantorForm action="delete" item={item} {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(2);
    });

    expect(baseProps.onSuccess).toHaveBeenCalled();
  });

  it("no envía si faltan campos (add)", async () => {
    render(<GuarantorForm action="add" {...baseProps} />);
    const btn = screen.getByRole("button", { name: /confirmar/i });
    expect(btn).toBeDisabled();
  });

  it("deshabilita botón mientras saving", async () => {
    mockCreate.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
    );

    render(<GuarantorForm action="add" {...baseProps} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), "Juan");
    await userEvent.type(screen.getByLabelText(/email/i), "juan@mail.com");
    await userEvent.type(screen.getByLabelText(/teléfono/i), "1234567890");

    const btn = screen.getByRole("button", { name: /confirmar/i });
    await userEvent.click(btn);

    expect(btn).toBeDisabled();
  });
});
