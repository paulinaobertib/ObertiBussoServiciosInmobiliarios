/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UtilitiesForm } from "../../../components/utilities/UtilitiesForm";
import { postUtility, putUtility, deleteUtility } from "../../../services/utility.service";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";

vi.mock("../../../services/utility.service", () => ({
  postUtility: vi.fn(),
  putUtility: vi.fn(),
  deleteUtility: vi.fn(),
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));

describe("UtilitiesForm", () => {
  const mockShowAlert = vi.fn();
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useGlobalAlert as any).mockReturnValue({ showAlert: mockShowAlert });
  });

  it("deshabilita el botón si el nombre está vacío en modo add", () => {
    render(<UtilitiesForm action="add" onDone={mockOnDone} />);
    const button = screen.getByRole("button", { name: /Confirmar/i });
    expect(button).toBeDisabled();
  });

  it("crea una utility correctamente (add)", async () => {
    (postUtility as any).mockResolvedValueOnce({});
    render(<UtilitiesForm action="add" onDone={mockOnDone} />);
    const input = screen.getByLabelText("Nombre");
    fireEvent.change(input, { target: { value: "Nueva" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    await waitFor(() => {
      expect(postUtility).toHaveBeenCalledWith({ id: 0, name: "Nueva" });
      expect(mockShowAlert).toHaveBeenCalledWith("Servicio creado", "success");
      expect(mockOnDone).toHaveBeenCalledWith({
        action: "add",
        form: { id: 0, name: "Nueva" },
      });
    });
  });

  it("edita una utility correctamente (edit)", async () => {
    (putUtility as any).mockResolvedValueOnce({});
    render(<UtilitiesForm action="edit" item={{ id: 5, name: "Vieja" }} onDone={mockOnDone} />);
    const input = screen.getByLabelText("Nombre");
    fireEvent.change(input, { target: { value: "Actualizada" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    await waitFor(() => {
      expect(putUtility).toHaveBeenCalledWith({ id: 5, name: "Actualizada" });
      expect(mockShowAlert).toHaveBeenCalledWith("Servicio actualizado", "success");
      expect(mockOnDone).toHaveBeenCalledWith({
        action: "edit",
        form: { id: 5, name: "Actualizada" },
      });
    });
  });

  it("elimina una utility correctamente (delete)", async () => {
    (deleteUtility as any).mockResolvedValueOnce({});
    render(<UtilitiesForm action="delete" item={{ id: 10, name: "Borrar" }} onDone={mockOnDone} />);
    const button = screen.getByRole("button", { name: /Eliminar/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);

    await waitFor(() => {
      expect(deleteUtility).toHaveBeenCalledWith(10);
      expect(mockShowAlert).toHaveBeenCalledWith("Servicio eliminado", "success");
      expect(mockOnDone).toHaveBeenCalledWith({
        action: "delete",
        form: { id: 10, name: "Borrar" },
      });
    });
  });

  it("muestra error si post falla", async () => {
    (postUtility as any).mockRejectedValueOnce(new Error("falló"));
    render(<UtilitiesForm action="add" onDone={mockOnDone} />);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "X" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith("falló", "error");
    });
  });

  it("muestra error genérico si no hay message en el error", async () => {
    (putUtility as any).mockRejectedValueOnce({});
    render(<UtilitiesForm action="edit" item={{ id: 3, name: "Algo" }} onDone={mockOnDone} />);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Edit" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith("Error al guardar servicio", "error");
    });
  });

  it("deshabilita input y botón en modo delete", () => {
    render(<UtilitiesForm action="delete" item={{ id: 2, name: "Eliminar" }} onDone={mockOnDone} />);
    expect(screen.getByLabelText("Nombre")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Eliminar/i })).not.toBeDisabled();
  });
});
