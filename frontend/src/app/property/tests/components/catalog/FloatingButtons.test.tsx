import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingButtons } from "../../../components/catalog/FloatingButtons";
import { useAuthContext } from "../../../../user/context/AuthContext";
import { vi, type Mock } from "vitest";

vi.mock("../../../../user/context/AuthContext");

const mockUseAuthContext = useAuthContext as unknown as Mock;

describe("FloatingButtons", () => {
  const mockOnAction = vi.fn();
  const mockToggleSelectionMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza acciones si no es admin", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons onAction={mockOnAction} selectionMode={false} toggleSelectionMode={mockToggleSelectionMode} />
    );

    expect(screen.queryByLabelText(/Acciones de Propiedad/i)).not.toBeInTheDocument();
  });

  it("no muestra los FABs de usuario cuando es admin", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons onAction={mockOnAction} selectionMode={false} toggleSelectionMode={mockToggleSelectionMode} />
    );

    expect(screen.getByLabelText(/Acciones de Propiedad/i)).toBeInTheDocument();
  });

  it("muestra SpeedDial y llama onAction para admin", async () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons onAction={mockOnAction} selectionMode={true} toggleSelectionMode={mockToggleSelectionMode} />
    );

    fireEvent.click(screen.getByLabelText(/Acciones de Propiedad/i));

    fireEvent.click(await screen.findByLabelText(/Agregar/i));
    expect(mockOnAction).toHaveBeenCalledWith("create");

    fireEvent.click(await screen.findByLabelText(/Editar/i));
    expect(mockOnAction).toHaveBeenCalledWith("edit");

    fireEvent.click(await screen.findByLabelText(/Eliminar/i));
    expect(mockOnAction).toHaveBeenCalledWith("delete");
  });

  it("cierra el SpeedDial y llama toggleSelectionMode cuando selectionMode es true", async () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons onAction={mockOnAction} selectionMode={true} toggleSelectionMode={mockToggleSelectionMode} />
    );

    fireEvent.click(screen.getByLabelText(/Acciones de Propiedad/i));
    fireEvent.click(await screen.findByLabelText(/Agregar/i));

    expect(mockToggleSelectionMode).toHaveBeenCalledTimes(1);
  });

  it("no llama toggleSelectionMode cuando selectionMode es false", async () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons onAction={mockOnAction} selectionMode={false} toggleSelectionMode={mockToggleSelectionMode} />
    );

    fireEvent.click(screen.getByLabelText(/Acciones de Propiedad/i));
    fireEvent.click(await screen.findByLabelText(/Editar/i));

    expect(mockToggleSelectionMode).not.toHaveBeenCalled();
  });
});
