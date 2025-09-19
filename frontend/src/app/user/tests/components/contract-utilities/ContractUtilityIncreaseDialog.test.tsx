// src/app/user/tests/components/contract-utilities/ContractUtilityIncreaseDialog.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContractUtilityIncreaseDialog } from "../../../components/contract-utilities/ContractUtilityIncreaseDialog";
import { postContractUtilityIncrease } from "../../../services/contractUtilityIncrease.service";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";

// --- Mocks ---
vi.mock("../../../services/contractUtilityIncrease.service", () => ({
  postContractUtilityIncrease: vi.fn(),
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
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
  const mockShowAlert = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useGlobalAlert as any).mockReturnValue({ showAlert: mockShowAlert });
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
      <ContractUtilityIncreaseDialog
        open={true}
        contractUtilityId={1}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );
    expect(screen.getByText("Confirmar")).toBeDisabled();
  });

  it("deshabilita confirmar cuando no es válido", () => {
    renderDialog();
    fireEvent.click(screen.getByTestId("set-invalid"));
    expect(screen.getByText("Confirmar")).toBeDisabled();
  });

  it("flujo exitoso: guarda, alerta y llama onSaved", async () => {
    (postContractUtilityIncrease as any).mockResolvedValue({});
    renderDialog();
    fireEvent.click(screen.getByTestId("set-valid"));
    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(postContractUtilityIncrease).toHaveBeenCalledWith({
        adjustmentDate: "2025-01-01",
        amount: 100,
        contractUtilityId: 1,
      });
      expect(mockShowAlert).toHaveBeenCalledWith(
        "Aumento de servicio creado con éxito",
        "success"
      );
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });

  it("flujo de error: muestra alerta de error", async () => {
    (postContractUtilityIncrease as any).mockRejectedValue(new Error("fail"));
    renderDialog();
    fireEvent.click(screen.getByTestId("set-valid"));
    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith("fail", "error");
    });
  });

  it("cancelar llama onClose", () => {
    renderDialog();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("no intenta guardar si contractUtilityId es null", () => {
    render(
      <ContractUtilityIncreaseDialog
        open={true}
        contractUtilityId={null}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );
    fireEvent.click(screen.getByTestId("set-valid"));
    fireEvent.click(screen.getByText("Confirmar"));
    expect(postContractUtilityIncrease).not.toHaveBeenCalled();
  });
});
