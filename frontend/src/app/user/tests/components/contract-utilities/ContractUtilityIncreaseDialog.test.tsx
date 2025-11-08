// src/app/user/tests/components/contract-utilities/ContractUtilityIncreaseDialog.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContractUtilityIncreaseDialog } from "../../../components/contract-utilities/ContractUtilityIncreaseDialog";
import { useContractUtilityIncreases } from "../../../hooks/contracts/useContractUtilityIncreases";

// --- Mock del hook centralizado ---
vi.mock("../../../hooks/contracts/useContractUtilityIncreases", () => ({
  useContractUtilityIncreases: vi.fn(),
}));

// mock del form: agrega botones visibles con data-testid
vi.mock("../../../components/contract-utilities/UtilityIncreaseForm", () => ({
  UtilityIncreaseForm: ({ onChange }: any) => (
    <div>
      <button data-testid="set-valid" onClick={() => onChange({ adjustmentDate: "2025-01-01", amount: "100" })}>
        Set Valid
      </button>
      <button data-testid="set-invalid" onClick={() => onChange({ adjustmentDate: "", amount: "" })}>
        Set Invalid
      </button>
    </div>
  ),
}));

describe("ContractUtilityIncreaseDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSaved = vi.fn();
  const mockCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useContractUtilityIncreases as Mock).mockReturnValue({
      createIncrease: mockCreate,
      saving: false,
    });
  });

  const renderDialog = (props = {}) =>
    render(
      <ContractUtilityIncreaseDialog
        open={true}
        contractUtilityId={1}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
        {...props}
      />
    );

  it("renderiza título y botones", () => {
    renderDialog();
    expect(screen.getByText("Nuevo Aumento de Servicio")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("resetea valores cuando se abre", () => {
    const { rerender } = renderDialog({ open: false });
    rerender(
      <ContractUtilityIncreaseDialog open={true} contractUtilityId={1} onClose={mockOnClose} onSaved={mockOnSaved} />
    );
    expect(screen.getByText("Confirmar")).toBeDisabled();
  });

  it("deshabilita confirmar cuando no es válido", () => {
    renderDialog();
    fireEvent.click(screen.getByTestId("set-invalid"));
    expect(screen.getByText("Confirmar")).toBeDisabled();
  });

  it("flujo exitoso: guarda y llama onSaved", async () => {
    mockCreate.mockResolvedValue(true);

    renderDialog();
    fireEvent.click(screen.getByTestId("set-valid"));
    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        contractUtilityId: 1,
        adjustmentDate: "2025-01-01",
        amount: 100,
      });
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });

  it("flujo fallido: no llama onSaved si createIncrease devuelve false", async () => {
    mockCreate.mockResolvedValue(false);

    renderDialog();
    fireEvent.click(screen.getByTestId("set-valid"));
    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(mockOnSaved).not.toHaveBeenCalled();
    });
  });

  it("cancelar llama onClose", () => {
    renderDialog();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("no intenta guardar si contractUtilityId es null", () => {
    render(
      <ContractUtilityIncreaseDialog open={true} contractUtilityId={null} onClose={mockOnClose} onSaved={mockOnSaved} />
    );
    fireEvent.click(screen.getByTestId("set-valid"));
    fireEvent.click(screen.getByText("Confirmar"));
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
