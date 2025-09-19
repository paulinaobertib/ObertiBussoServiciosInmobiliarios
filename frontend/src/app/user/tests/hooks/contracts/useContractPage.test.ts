/// <reference types="vitest" />
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { useContractsPage } from "../../../hooks/contracts/useContractsPage";

// --- Mocks ---
const mockNavigate = vi.fn();

// hacemos que el ask simule confirmación automática
const mockAsk = vi.fn((_msg?: any, cb?: any) => {
  if (cb) cb();
});
const mockDialog = () => null;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: vi.fn(),
}));

vi.mock("../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: () => ({
    ask: vi.fn((_msg?: any, cb?: any) => {
      mockAsk(_msg, cb);
      if (cb) cb();
      return Promise.resolve(true); // <-- clave: simula confirmación async
    }),
    DialogUI: mockDialog,
  }),
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../../../services/contract.service", () => ({
  getAllContracts: vi.fn(),
  getContractsByUserId: vi.fn(),
  deleteContract: vi.fn(),
  patchContractStatus: vi.fn(),
}));

import { useAuthContext } from "../../../context/AuthContext";
import { useLocation } from "react-router-dom";
import {
  getAllContracts,
  getContractsByUserId,
} from "../../../services/contract.service";
import { ContractStatus } from "../../../types/contract";

describe("useContractsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLocation as Mock).mockReturnValue({
      pathname: "/contracts",
      state: {},
      key: "loc",
    });
    (useAuthContext as Mock).mockReturnValue({
      info: { id: "u1" },
      isAdmin: true,
    });
  });

  it("carga contratos con getAllContracts si es admin", async () => {
    (getAllContracts as Mock).mockResolvedValue([
      { id: 1, contractStatus: "ACTIVO" },
    ]);

    const { result } = renderHook(() => useContractsPage());

    await waitFor(() => {
      expect(result.current.all).toEqual([{ id: 1, contractStatus: "ACTIVO" }]);
      expect(result.current.filtered).toEqual([
        { id: 1, contractStatus: "ACTIVO" },
      ]);
      expect(getAllContracts).toHaveBeenCalled();
    });
  });

  it("carga contratos con getContractsByUserId si NO es admin", async () => {
    (useAuthContext as Mock).mockReturnValue({
      info: { id: "u1" },
      isAdmin: false,
    });
    (getContractsByUserId as Mock).mockResolvedValue([
      { id: 2, contractStatus: "INACTIVO" },
    ]);

    const { result } = renderHook(() => useContractsPage());

    await waitFor(() => {
      expect(result.current.all[0].id).toBe(2);
      expect(getContractsByUserId).toHaveBeenCalledWith("u1");
    });
  });

  it("filtra por estado con statusFilter", async () => {
    (getAllContracts as Mock).mockResolvedValue([
      { id: 1, contractStatus: "ACTIVO" },
      { id: 2, contractStatus: "INACTIVO" },
    ]);

    const { result } = renderHook(() => useContractsPage());

    await waitFor(() => expect(result.current.all.length).toBe(2));

    act(() => {
      result.current.setStatusFilter("INACTIVO" as any);
    });

    await waitFor(() => {
      expect(result.current.filtered).toEqual([
        { id: 2, contractStatus: "INACTIVO" },
      ]);
    });
  });

  it("handleSearch aplica filtro", async () => {
    const { result } = renderHook(() => useContractsPage());

    act(() => {
      result.current.handleSearch([
        { id: 1, contractStatus: ContractStatus.ACTIVO } as any,
      ]);
    });

    expect(result.current.filtered).toEqual([
      { id: 1, contractStatus: ContractStatus.ACTIVO },
    ]);
  });

it("detecta state.justCreated y navega al detalle", async () => {
  (useLocation as Mock).mockReturnValue({
    pathname: "/contracts",
    state: { justCreated: true, createdId: 7 },
    key: "loc",
  });

  renderHook(() => useContractsPage());

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalled();
  });
});

});
