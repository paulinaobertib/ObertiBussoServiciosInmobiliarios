/// <reference types="vitest" />
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { useContractFilters } from "../../../hooks/contracts/useContractFilters";

// --- Mocks de servicios ---
vi.mock("../../../services/contract.service", () => ({
  getAllContracts: vi.fn(),
  getContractsByDateRange: vi.fn(),
  getContractsByType: vi.fn(),
}));

import { getAllContracts, getContractsByDateRange, getContractsByType } from "../../../services/contract.service";
import { ContractStatus } from "../../../types/contract";

describe("useContractFilters", () => {
  const onFiltered = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("llama getAllContracts cuando no hay filtros", async () => {
    (getAllContracts as Mock).mockResolvedValue([{ id: 1, contractStatus: "ACTIVE" }]);

    renderHook(() => useContractFilters("ALL", onFiltered));

    await waitFor(() => {
      expect(getAllContracts).toHaveBeenCalled();
      expect(onFiltered).toHaveBeenCalledWith([{ id: 1, contractStatus: "ACTIVE" }]);
    });
  });

  it("llama getContractsByType cuando se setea typeFilter", async () => {
    (getContractsByType as Mock).mockResolvedValue([{ id: 2, contractStatus: "ACTIVE" }]);

    const { result } = renderHook(() => useContractFilters("ALL", onFiltered));

    act(() => {
      result.current.setTypeFilter("RENT" as any);
    });

    await waitFor(() => {
      expect(getContractsByType).toHaveBeenCalledWith("RENT");
      expect(onFiltered).toHaveBeenCalledWith([{ id: 2, contractStatus: "ACTIVE" }]);
    });
  });

  it("llama getContractsByDateRange cuando se setean dateFrom y dateTo", async () => {
    (getContractsByDateRange as Mock).mockResolvedValue([{ id: 3, contractStatus: "ACTIVE" }]);

    const { result } = renderHook(() => useContractFilters("ALL", onFiltered));

    act(() => {
      result.current.setDateFrom("2025-01-01");
      result.current.setDateTo("2025-01-31");
    });

    await waitFor(() => {
      expect(getContractsByDateRange).toHaveBeenCalledWith("2025-01-01", "2025-01-31");
      expect(onFiltered).toHaveBeenCalledWith([{ id: 3, contractStatus: "ACTIVE" }]);
    });
  });

  it("filtra por globalStatus cuando no es ALL", async () => {
    (getAllContracts as Mock).mockResolvedValue([
      { id: 1, contractStatus: ContractStatus.ACTIVO },
      { id: 2, contractStatus: ContractStatus.INACTIVO },
    ]);

    renderHook(() => useContractFilters(ContractStatus.ACTIVO, onFiltered));

    await waitFor(() => {
      expect(onFiltered).toHaveBeenCalledWith([{ id: 1, contractStatus: ContractStatus.ACTIVO }]);
    });
  });
});
