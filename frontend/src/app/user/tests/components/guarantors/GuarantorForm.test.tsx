/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuarantorForm } from "../../../components/guarantors/GuarantorForm";

// --- Mocks de servicios ---
import {
  postGuarantor,
  putGuarantor,
  deleteGuarantor,
} from "../../../services/guarantor.service";

vi.mock("../../../services/guarantor.service", () => ({
  postGuarantor: vi.fn(),
  putGuarantor: vi.fn(),
  deleteGuarantor: vi.fn(),
}));

// --- Mock del contexto de alertas ---
const mockShowAlert = vi.fn();
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

describe("GuarantorForm", () => {
  const baseProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea garante exitosamente", async () => {
    (postGuarantor as any).mockResolvedValueOnce({});
    render(<GuarantorForm action="add" {...baseProps} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), "Juan");
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "juan@mail.com");
    await userEvent.type(screen.getByLabelText(/teléfono/i), "1234567890");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => {
      expect(postGuarantor).toHaveBeenCalledWith({
        name: "Juan",
        email: "juan@mail.com",
        phone: "1234567890",
      });
    });
    expect(mockShowAlert).toHaveBeenCalledWith("Garante creado con éxito", "success");
    expect(baseProps.onSuccess).toHaveBeenCalled();
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("edita garante exitosamente", async () => {
    (putGuarantor as any).mockResolvedValueOnce({});
    const item = { id: 1, name: "Pepe", email: "pepe@mail.com", phone: "1234567890" };

    render(<GuarantorForm action="edit" item={item} {...baseProps} />);

    await userEvent.clear(screen.getByLabelText(/nombre/i));
    await userEvent.type(screen.getByLabelText(/nombre/i), "Pepe Modificado");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => {
      expect(putGuarantor).toHaveBeenCalledWith(1, {
        id: 1,
        name: "Pepe Modificado",
        email: "pepe@mail.com",
        phone: "1234567890",
      });
    });
    expect(mockShowAlert).toHaveBeenCalledWith("Garante actualizado con éxito", "success");
    expect(baseProps.onSuccess).toHaveBeenCalled();
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("elimina garante exitosamente", async () => {
    (deleteGuarantor as any).mockResolvedValueOnce({});
    const item = { id: 2, name: "Ana", email: "ana@mail.com", phone: "1234567890" };

    render(<GuarantorForm action="delete" item={item} {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    await waitFor(() => {
      expect(deleteGuarantor).toHaveBeenCalledWith(2);
    });
    expect(mockShowAlert).toHaveBeenCalledWith("Garante eliminado con éxito", "success");
    expect(baseProps.onSuccess).toHaveBeenCalled();
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("maneja error en servicio", async () => {
    (postGuarantor as any).mockRejectedValueOnce({
      response: { data: "Error en backend" },
    });

    render(<GuarantorForm action="add" {...baseProps} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), "Juan");
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "juan@mail.com");
    await userEvent.type(screen.getByLabelText(/teléfono/i), "1234567890");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith("Error en backend", "error");
    });
  });

  it("botón cancelar ejecuta onClose", async () => {
    render(<GuarantorForm action="add" {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("deshabilita botones mientras saving", async () => {
    (postGuarantor as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    );

    render(<GuarantorForm action="add" {...baseProps} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), "Juan");
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "juan@mail.com");
    await userEvent.type(screen.getByLabelText(/teléfono/i), "1234567890");

    const btn = screen.getByRole("button", { name: /guardar/i });
    await userEvent.click(btn);

    expect(btn).toBeDisabled();
  });
});
