import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { forwardRef } from "react";

const mockGetData = vi.fn();

vi.mock("../../../services/contractUtility.service", () => ({
  getContractUtilityById: vi.fn(),
  postContractUtility: vi.fn(),
  putContractUtility: vi.fn(),
}));

vi.mock("../../../hooks/useUtilities", () => ({
  useUtilities: vi.fn(),
}));

vi.mock("../../../components/contract-utilities/ContractUtilityForm", () => ({
  ContractUtilityForm: forwardRef((_: any, ref: any) => {
    if (ref) {
      (ref as any).current = {
        getData: mockGetData,
      };
    }
    return <div data-testid="contract-utility-form">FormMock</div>;
  }),
}));

import {
  getContractUtilityById,
  postContractUtility,
  putContractUtility,
} from "../../../services/contractUtility.service";
import { useUtilities } from "../../../hooks/useUtilities";
import { ContractUtilityDialog } from "../../../components/contract-utilities/ManageContractUtility";

describe("ContractUtilityDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUtilities as any).mockReturnValue({
      fetchById: vi.fn().mockResolvedValue({ id: 1, name: "Water" }),
    });
  });

  const renderDialog = (props: any = {}) =>
    render(
      <ContractUtilityDialog
        open={true}
        mode="add"
        contractId={99}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
        utility={{ id: 1, name: "Water" }}
        {...props}
      />
    );

  it("muestra título correcto en modo add con utility", () => {
    renderDialog();
    expect(screen.getByText("Asignar: Water")).toBeInTheDocument();
    expect(screen.getByTestId("contract-utility-form")).toBeInTheDocument();
  });

  it("muestra título genérico en modo add sin utility", () => {
    renderDialog({ utility: null });
    expect(screen.getByText("Asignar servicio")).toBeInTheDocument();
  });

  it("muestra loader en modo edit mientras carga", async () => {
    (getContractUtilityById as any).mockResolvedValue({ id: 5, utilityId: 1 });
    renderDialog({ mode: "edit", contractUtilityId: 5 });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    await waitFor(() =>
      expect(getContractUtilityById).toHaveBeenCalledWith(5)
    );
  });

  it("guardar en modo add llama postContractUtility y onSaved/onClose", async () => {
    (postContractUtility as any).mockResolvedValue({});
    mockGetData.mockReturnValue({
      initialAmount: 100,
      periodicity: "M",
      contractId: 99,
      utilityId: 1,
    });
    renderDialog();
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => {
      expect(postContractUtility).toHaveBeenCalledWith({
        initialAmount: 100,
        periodicity: "M",
        contractId: 99,
        utilityId: 1,
      });
      expect(mockOnSaved).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("guardar en modo edit llama putContractUtility", async () => {
    (getContractUtilityById as any).mockResolvedValue({
      id: 5,
      utilityId: 1,
    });
    (putContractUtility as any).mockResolvedValue({});
    mockGetData.mockReturnValue({
      initialAmount: 200,
      periodicity: "Q",
      lastPaidAmount: 50,
      lastPaidDate: "2025-01-01",
      notes: "note",
      contractId: 99,
      utilityId: 1,
    });

    renderDialog({ mode: "edit", contractUtilityId: 5 });
    await waitFor(() => expect(getContractUtilityById).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => {
      expect(putContractUtility).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          initialAmount: 200,
          periodicity: "Q",
        })
      );
      expect(mockOnSaved).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("no guarda si initialAmount es <= 0", async () => {
    mockGetData.mockReturnValue({ initialAmount: 0 });
    renderDialog();
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => {
      expect(postContractUtility).not.toHaveBeenCalled();
      expect(putContractUtility).not.toHaveBeenCalled();
    });
  });

  it("botón Cancelar llama onClose", () => {
    renderDialog();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
