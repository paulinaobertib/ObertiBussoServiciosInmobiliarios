/// <reference types="vitest" />
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContractsPage } from "../../../hooks/contracts/useContractsPage";
import { getAllContracts, getContractsByUserId } from "../../../services/contract.service";
import { ContractStatus, ContractType } from "../../../types/contract";

// Mocks
vi.mock("../../../services/contract.service", () => ({
  getAllContracts: vi.fn(),
  getContractsByUserId: vi.fn(),
}));
vi.mock("../../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: vi.fn(() => "error") }),
}));
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

import { useAuthContext } from "../../../context/AuthContext";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import { useNavigate, useLocation } from "react-router-dom";
import { PaymentCurrency } from "../../../types/payment";

describe("useContractsPage", () => {
  const navigate = vi.fn();
  const confirm = vi.fn();
  const success = vi.fn();

    beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(navigate);
    (useLocation as any).mockReturnValue({ pathname: "/contracts", state: {}, key: "1" });
    (useGlobalAlert as any).mockReturnValue({
        showAlert: vi.fn(), 
        confirm,
        success,
    });
    });

  it("carga contratos como admin", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockResolvedValue([{ id: 1, contractStatus: ContractStatus.ACTIVO }]);

    const { result } = renderHook(() => useContractsPage());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.all).toEqual([{ id: 1, contractStatus: ContractStatus.ACTIVO }]);
      expect(result.current.filtered).toEqual([{ id: 1, contractStatus: ContractStatus.ACTIVO }]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("carga contratos como user", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 99 }, isAdmin: false });
    (getContractsByUserId as any).mockResolvedValue([{ id: 2, contractStatus: ContractStatus.INACTIVO }]);

    const { result } = renderHook(() => useContractsPage());

    await waitFor(() => {
      expect(getContractsByUserId).toHaveBeenCalledWith(99);
      expect(result.current.all[0].id).toBe(2);
    });
  });

  it("maneja error en load", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useContractsPage());

    await waitFor(() => {
      expect(result.current.all).toEqual([]);
      expect(result.current.filtered).toEqual([]);
    });
  });

  it("filtra por statusFilter", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockResolvedValue([
      { id: 1, contractStatus: ContractStatus.ACTIVO },
      { id: 2, contractStatus: ContractStatus.INACTIVO },
    ]);

    const { result } = renderHook(() => useContractsPage());

    await waitFor(() => expect(result.current.all.length).toBe(2));

    act(() => {
      result.current.setStatusFilter(ContractStatus.ACTIVO);
    });

    await waitFor(() => {
      expect(result.current.filtered).toEqual([{ id: 1, contractStatus: ContractStatus.ACTIVO }]);
    });
  });

  it("handleSearch respeta statusFilter", () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockResolvedValue([]);

    const { result } = renderHook(() => useContractsPage());

    act(() => {
      result.current.setStatusFilter(ContractStatus.INACTIVO);
      result.current.handleSearch([{
          id: 1, contractStatus: ContractStatus.ACTIVO,
          userId: "",
          propertyId: 0,
          contractType: ContractType.TEMPORAL,
          startDate: "",
          endDate: "",
          currency: PaymentCurrency.USD,
          initialAmount: 0,
          adjustmentFrequencyMonths: 0,
          lastPaidAmount: null,
          lastPaidDate: null,
          note: null,
          hasDeposit: false,
          depositAmount: null,
          depositNote: null,
          adjustmentIndexId: null
      }]);
    });

    expect(result.current.filtered).toEqual([]);
  });

  it("maneja modales (paying, increasing, history)", () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockResolvedValue([]);

    const { result } = renderHook(() => useContractsPage());

    act(() => {
      result.current.setPaying({ id: 1 } as any);
      result.current.setIncreasing({ id: 2 } as any);
      result.current.setHistory({ id: 3 } as any);
    });

    expect(result.current.paying?.id).toBe(1);
    expect(result.current.increasing?.id).toBe(2);
    expect(result.current.history?.id).toBe(3);
  });

  it("maneja justCreated con confirm (va al detalle)", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockResolvedValue([]);
    (useLocation as any).mockReturnValue({
      pathname: "/contracts",
      key: "loc1",
      state: { justCreated: true, createdId: 77 },
    });
    (useGlobalAlert as any).mockReturnValue({ confirm });

    confirm.mockResolvedValue(true);

    renderHook(() => useContractsPage());

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/contracts/77", { replace: true });
    });
  });

  it("maneja justCreated con confirm (más tarde)", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockResolvedValue([]);
    (useLocation as any).mockReturnValue({
      pathname: "/contracts",
      key: "loc2",
      state: { justCreated: true, createdId: 88 },
    });
    (useGlobalAlert as any).mockReturnValue({ confirm });

    confirm.mockResolvedValue(false);

    renderHook(() => useContractsPage());

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/contracts", { replace: true, state: {} });
    });
  });

  it("maneja justCreated con success", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: 1 }, isAdmin: true });
    (getAllContracts as any).mockResolvedValue([]);
    (useLocation as any).mockReturnValue({
      pathname: "/contracts",
      key: "loc3",
      state: { justCreated: true, createdId: 99 },
    });
    (useGlobalAlert as any).mockReturnValue({ success });

    success.mockResolvedValue(true);

    renderHook(() => useContractsPage());

    await waitFor(() => {
      expect(success).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith("/contracts", { replace: true, state: {} });
    });
  });
});
