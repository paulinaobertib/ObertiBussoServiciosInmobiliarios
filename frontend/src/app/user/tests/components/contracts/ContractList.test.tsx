import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContractList } from "../../../components/contracts/ContractList";
import type { Contract } from "../../../types/contract";

// ────────────────────────────────
// mock AuthContext
vi.mock("../../../context/AuthContext", () => ({
  useAuthContext: () => ({ isAdmin: true }),
}));

// ────────────────────────────────
// mock ContractItem
const MockContractItem = vi.fn((props: { contract: Contract }) => (
  <div data-testid="contract-item" data-id={props.contract.id} />
));
vi.mock("../../../components/contracts/ContractItem", () => ({
  ContractItem: (props: any) => MockContractItem(props),
}));

// ────────────────────────────────
// contratos base
const c1: Contract = {
  id: 1,
  userId: "u1",
  propertyId: 101,
  contractType: "VIVIENDA" as any,
  contractStatus: "ACTIVO" as any,
  startDate: "2024-01-01",
  endDate: "2025-01-01",
  currency: "ARS" as any,
  initialAmount: 1000,
  adjustmentFrequencyMonths: 12,
  lastPaidAmount: null,
  lastPaidDate: null,
  note: null,
  hasDeposit: false,
  depositAmount: null,
  depositNote: null,
  adjustmentIndexId: null,
};

const c2: Contract = {
  ...c1,
  id: 2,
  startDate: "2024-06-01",
};

beforeEach(() => {
  MockContractItem.mockClear();
});

describe("ContractList", () => {
  it("muestra mensaje cuando no hay contratos", () => {
    render(<ContractList contracts={[]} />);
    expect(screen.getByText(/No hay contratos/i)).toBeInTheDocument();
  });

  it("renderiza un ContractItem por cada contrato", () => {
    render(<ContractList contracts={[c1, c2]} />);
    const items = screen.getAllByTestId("contract-item");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("data-id", "2"); // c2 primero (más reciente)
    expect(items[1]).toHaveAttribute("data-id", "1"); // c1 después
  });

  it("pasa las props correctas a ContractItem", () => {
    render(<ContractList contracts={[c1]} />);
    const props = MockContractItem.mock.calls[0]?.[0] as any;
    expect(props.contract.id).toBe(1);
    expect(props.isAdmin).toBe(true);
  });
});
