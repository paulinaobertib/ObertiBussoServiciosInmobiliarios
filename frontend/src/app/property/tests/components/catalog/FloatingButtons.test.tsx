import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingButtons } from "../../../components/catalog/FloatingButtons";
import { useAuthContext } from "../../../../user/context/AuthContext";
import { usePropertiesContext } from "../../../context/PropertiesContext";
import { vi, type Mock } from "vitest";

vi.mock("../../../../user/context/AuthContext");
vi.mock("../../../context/PropertiesContext");

const mockUseAuthContext = useAuthContext as unknown as Mock;
const mockUsePropertiesContext = usePropertiesContext as unknown as Mock;

describe("FloatingButtons", () => {
  const mockOnAction = vi.fn();
  const mockToggleSelectionMode = vi.fn();
  const mockOnCompare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePropertiesContext.mockReturnValue({ disabledCompare: false });
  });

  it("muestra los FABs de usuario si no es admin", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
    );

    expect(screen.getByTestId("user-action-compare")).toBeInTheDocument();
    expect(screen.getByTestId("user-action-toggle-selection")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Acciones de Propiedad/i)).not.toBeInTheDocument();
  });

  it("llama a onCompare al clickear el botón de comparar", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
    );

    fireEvent.click(screen.getByTestId("user-action-compare"));
    expect(mockOnCompare).toHaveBeenCalledTimes(1);
  });

  it("llama a toggleSelectionMode al clickear el botón de selección", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
    );

    fireEvent.click(screen.getByTestId("user-action-toggle-selection"));
    expect(mockToggleSelectionMode).toHaveBeenCalledTimes(1);
  });

  it("deshabilita el botón comparar cuando disabledCompare es true", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: false });
    mockUsePropertiesContext.mockReturnValue({ disabledCompare: true });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
    );

    const compareButton = screen.getByTestId("user-action-compare");
    expect(compareButton).toBeDisabled();
    fireEvent.click(compareButton);
    expect(mockOnCompare).not.toHaveBeenCalled();
  });

  it("no muestra los FABs de usuario cuando es admin", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
    );

    expect(screen.queryByTestId("user-action-compare")).not.toBeInTheDocument();
    expect(screen.queryByTestId("user-action-toggle-selection")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Acciones de Propiedad/i)).toBeInTheDocument();
  });

  it("muestra SpeedDial y llama onAction para admin", async () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={true}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
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
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={true}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Acciones de Propiedad/i));
    fireEvent.click(await screen.findByLabelText(/Agregar/i));

    expect(mockToggleSelectionMode).toHaveBeenCalledTimes(1);
  });

  it("no llama toggleSelectionMode cuando selectionMode es false", async () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Acciones de Propiedad/i));
    fireEvent.click(await screen.findByLabelText(/Editar/i));

    expect(mockToggleSelectionMode).not.toHaveBeenCalled();
  });

  it("deshabilita el comparador si no se provee onCompare", () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
      />,
    );

    expect(screen.getByTestId("user-action-compare")).toBeDisabled();
  });
});
