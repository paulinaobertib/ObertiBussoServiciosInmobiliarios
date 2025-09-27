import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { forwardRef } from "react";
import { UtilitiesPickerDialog } from "../../../components/contract-utilities/SelectUtilitiesDialog";
import { useUtilities } from "../../../hooks/useUtilities";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import {
  getContractUtilitiesByContract,
  postContractUtility,
} from "../../../services/contractUtility.service";

vi.mock("../../../hooks/useUtilities", () => ({
  useUtilities: vi.fn(),
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));

vi.mock("../../../services/contractUtility.service", () => ({
  getContractUtilitiesByContract: vi.fn(),
  postContractUtility: vi.fn(),
}));

const mockGetData = vi.fn();
vi.mock("../../../components/contract-utilities/ContractUtilityForm", () => ({
  ContractUtilityForm: forwardRef((_: any, ref: any) => {
    if (ref) {
      (ref as any).current = { getData: mockGetData };
    }
    return <div data-testid="contract-utility-form">FormMock</div>;
  }),
}));

vi.mock("../../../components/utilities/UtilitiesSection", () => ({
  UtilitiesSection: ({ toggleSelect }: any) => (
    <div>
      <button onClick={() => toggleSelect([1])}>SelectUtility</button>
      <button onClick={() => toggleSelect(null)}>Clear</button>
      <button onClick={() => toggleSelect([999])}>SelectDuplicate</button>
    </div>
  ),
}));

describe("UtilitiesPickerDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnUpdated = vi.fn();
  const mockShowAlert = vi.fn();
  const mockFetchById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUtilities as any).mockReturnValue({ fetchById: mockFetchById });
    (useGlobalAlert as any).mockReturnValue({ showAlert: mockShowAlert });
    (getContractUtilitiesByContract as any).mockResolvedValue([]);
    mockFetchById.mockResolvedValue({ id: 1, name: "Agua" });
    mockGetData.mockReturnValue({
      initialAmount: 100,
      utilityId: 1,
      contractId: 77,
    });
  });

  const renderDialog = (props: any = {}) =>
    render(
      <UtilitiesPickerDialog
        open={true}
        contractId={77}
        onClose={mockOnClose}
        onUpdated={mockOnUpdated}
        {...props}
      />
    );

  it("carga contract utilities al abrir", async () => {
    renderDialog();
    await waitFor(() =>
      expect(getContractUtilitiesByContract).toHaveBeenCalledWith(77)
    );
  });

  it("selecciona utilidad y renderiza formulario", async () => {
    renderDialog();
    fireEvent.click(screen.getByText("SelectUtility"));
    await waitFor(() =>
      expect(mockFetchById).toHaveBeenCalledWith(1)
    );
    expect(screen.getByTestId("contract-utility-form")).toBeInTheDocument();
  });

  it("limpia selección con Clear", () => {
    renderDialog();
    fireEvent.click(screen.getByText("Clear"));
    expect(screen.queryByTestId("contract-utility-form")).not.toBeInTheDocument();
  });

it("muestra alerta si se selecciona un servicio duplicado", async () => {
  const mockWarning = vi.fn();
  (useGlobalAlert as any).mockReturnValue({ warning: mockWarning });
  (getContractUtilitiesByContract as any).mockResolvedValue([{ utilityId: 999 }]);

  renderDialog();

  await waitFor(() => expect(getContractUtilitiesByContract).toHaveBeenCalled());

  fireEvent.click(screen.getByText("SelectDuplicate"));

  await waitFor(() =>
    expect(mockWarning).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Servicio ya vinculado",
        description: "Ese servicio ya está asociado a este contrato.",
      })
    )
  );
});

  it("guarda correctamente cuando initialAmount > 0", async () => {
    (postContractUtility as any).mockResolvedValue({});
    renderDialog();
    fireEvent.click(screen.getByText("SelectUtility"));
    await waitFor(() =>
      expect(screen.getByTestId("contract-utility-form")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => {
      expect(postContractUtility).toHaveBeenCalledWith(
        expect.objectContaining({
          initialAmount: 100,
          utilityId: 1,
          contractId: 77,
        })
      );
      expect(mockOnUpdated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("no guarda si initialAmount <= 0", async () => {
    mockGetData.mockReturnValue({ initialAmount: 0, utilityId: 1, contractId: 77 });
    renderDialog();
    fireEvent.click(screen.getByText("SelectUtility"));
    await waitFor(() =>
      expect(screen.getByTestId("contract-utility-form")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => expect(postContractUtility).not.toHaveBeenCalled());
  });

  it("botón Cancelar limpia selección", async () => {
    renderDialog();
    fireEvent.click(screen.getByText("SelectUtility"));
    await waitFor(() =>
      expect(screen.getByTestId("contract-utility-form")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByTestId("contract-utility-form")).not.toBeInTheDocument();
  });
});
