import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import { ContractsFilters } from "../../../components/contracts/ContractsFilters";
import { ContractStatus, ContractType } from "../../../types/contract";

// ────────────────────────────────
// Mock de useContractFilters
let mockTypeFilter = "ALL";
let mockSetTypeFilter = vi.fn();
let mockDateFrom = "";
let mockSetDateFrom = vi.fn();
let mockDateTo = "";
let mockSetDateTo = vi.fn();

vi.mock("../../../hooks/contracts/useContractFilters", () => ({
  useContractFilters: () => ({
    typeFilter: mockTypeFilter,
    setTypeFilter: mockSetTypeFilter,
    dateFrom: mockDateFrom,
    setDateFrom: mockSetDateFrom,
    dateTo: mockDateTo,
    setDateTo: mockSetDateTo,
  }),
}));

// ────────────────────────────────
// Helpers
const renderFilters = (props?: Partial<React.ComponentProps<typeof ContractsFilters>>) => {
  const defaultProps = {
    filter: "ALL" as "ALL" | ContractStatus,
    onFilterChange: vi.fn(),
    onSearch: vi.fn(),
  };
  return render(<ContractsFilters {...defaultProps} {...props} />);
};

// ────────────────────────────────
// Tests
describe("ContractsFilters", () => {
  beforeEach(() => {
    mockTypeFilter = "ALL";
    mockSetTypeFilter.mockReset();
    mockSetDateFrom.mockReset();
    mockSetDateTo.mockReset();
  });

  it("renderiza selects y inputs correctamente", () => {
    renderFilters();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasta")).toBeInTheDocument();
  });

  it("llama onFilterChange al cambiar estado", () => {
    const onFilterChange = vi.fn();
    renderFilters({ filter: "ALL", onFilterChange });
    fireEvent.mouseDown(screen.getByLabelText("Estado"));
    fireEvent.click(screen.getByRole("option", { name: "Activos" }));
    expect(onFilterChange).toHaveBeenCalledWith(ContractStatus.ACTIVO);
  });

  it("llama setTypeFilter al cambiar tipo", () => {
    renderFilters();
    fireEvent.mouseDown(screen.getByLabelText("Tipo"));
    fireEvent.click(screen.getByRole("option", { name: "Comercial" }));
    expect(mockSetTypeFilter).toHaveBeenCalledWith(ContractType.COMERCIAL);
  });

  it("llama setDateFrom y setDateTo al cambiar inputs", () => {
    renderFilters();
    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2024-01-01" } });
    expect(mockSetDateFrom).toHaveBeenCalledWith("2024-01-01");

    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2024-12-31" } });
    expect(mockSetDateTo).toHaveBeenCalledWith("2024-12-31");
  });

it("pasa correctamente los valores iniciales de fecha y tipo", () => {
  mockTypeFilter = ContractType.TEMPORAL;
  mockDateFrom = "2024-01-10";
  mockDateTo = "2024-02-10";

  renderFilters({ filter: ContractStatus.ACTIVO });

  // verificamos el texto renderizado en los combobox
  expect(screen.getByRole("combobox", { name: "Estado" })).toHaveTextContent("Activos");
  expect(screen.getByRole("combobox", { name: "Tipo" })).toHaveTextContent("Temporal");

  // inputs de fecha sí tienen value real
  expect(screen.getByLabelText("Desde")).toHaveValue("2024-01-10");
  expect(screen.getByLabelText("Hasta")).toHaveValue("2024-02-10");
});


});
