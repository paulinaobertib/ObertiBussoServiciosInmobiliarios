/// <reference types="vitest" />
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { useUtilities } from "../../hooks/useUtilities";

// --- Mocks de servicios ---
vi.mock("../../services/utility.service", () => ({
  getAllUtilities: vi.fn(),
  getUtilityById: vi.fn(),
  getUtilityByName: vi.fn(),
  getUtilitiesByContract: vi.fn(),
  getContractsByUtility: vi.fn(),
  postUtility: vi.fn(),
  putUtility: vi.fn(),
  deleteUtility: vi.fn(),
}));

// --- Mock de useApiErrors ---
const mockHandleError = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: mockHandleError }),
}));

// --- Mock de useGlobalAlert ---
const mockAlertApi = {
  success: vi.fn(),
  doubleConfirm: vi.fn().mockResolvedValue(true),
};
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlertApi,
}));

import {
  getAllUtilities,
  getUtilityById,
  getUtilityByName,
  postUtility,
  putUtility,
  deleteUtility,
} from "../../services/utility.service";

describe("useUtilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loadAll carga utilidades correctamente", async () => {
    (getAllUtilities as Mock).mockResolvedValue([{ id: 1, name: "Agua" }]);
    const { result } = renderHook(() => useUtilities());

    await act(async () => {
      const res = await result.current.loadAll();
      expect(res).toEqual([{ id: 1, name: "Agua" }]);
    });

    expect(result.current.utilities).toEqual([{ id: 1, name: "Agua" }]);
    expect(result.current.loading).toBe(false);
  });

  it("loadAll maneja error", async () => {
    (getAllUtilities as Mock).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useUtilities());

    await act(async () => {
      const res = await result.current.loadAll();
      expect(res).toEqual([]);
    });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.utilities).toEqual([]);
  });

  it("fetchByText retorna merged de remoto y local", async () => {
    (getUtilityByName as Mock).mockResolvedValue({ id: 2, name: "Gas" });
    (getAllUtilities as Mock).mockResolvedValue([
      { id: 1, name: "Agua" },
      { id: 2, name: "Gas" },
    ]);

    const { result } = renderHook(() => useUtilities());

    // primero cargar base
    await act(async () => {
      await result.current.loadAll();
    });

    let res: any[] = [];
    await act(async () => {
      res = await result.current.fetchByText("ga");
    });

    // Solo debe incluir Gas
    expect(res).toEqual([{ id: 2, name: "Gas" }]);
  });

  it("fetchByText retorna [] en error", async () => {
    (getUtilityByName as Mock).mockRejectedValue(new Error("fail"));
    (getAllUtilities as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useUtilities());

    let res: any[] = [];
    await act(async () => {
      res = await result.current.fetchByText("x");
    });

    expect(res).toEqual([]);
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it("fetchById retorna utility", async () => {
    (getUtilityById as Mock).mockResolvedValue({ id: 1, name: "Agua" });
    const { result } = renderHook(() => useUtilities());

    const res = await result.current.fetchById(1);
    expect(res).toEqual({ id: 1, name: "Agua" });
  });

  it("fetchById maneja error", async () => {
    (getUtilityById as Mock).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useUtilities());

    const res = await result.current.fetchById(1);
    expect(res).toBeNull();
    expect(mockHandleError).toHaveBeenCalled();
  });

  it("create llama postUtility y recarga", async () => {
    (postUtility as Mock).mockResolvedValue(undefined);
    (getAllUtilities as Mock).mockResolvedValue([{ id: 1, name: "Agua" }]);

    const { result } = renderHook(() => useUtilities());

    let ok = false;
    await act(async () => {
      ok = await result.current.create({ name: "Agua" } as any);
    });

    expect(ok).toBe(true);
    expect(postUtility).toHaveBeenCalled();
    expect(result.current.utilities).toEqual([{ id: 1, name: "Agua" }]);
  });

  it("update llama putUtility y recarga", async () => {
    (putUtility as Mock).mockResolvedValue(undefined);
    (getAllUtilities as Mock).mockResolvedValue([{ id: 1, name: "Agua" }]);

    const { result } = renderHook(() => useUtilities());

    let ok = false;
    await act(async () => {
      ok = await result.current.update({ id: 1, name: "Agua" } as any);
    });

    expect(ok).toBe(true);
    expect(putUtility).toHaveBeenCalled();
  });

  it("remove llama deleteUtility y recarga", async () => {
    (deleteUtility as Mock).mockResolvedValue(undefined);
    (getAllUtilities as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useUtilities());

    let ok = false;
    await act(async () => {
      ok = await result.current.remove(1);
    });

    expect(ok).toBe(true);
    expect(deleteUtility).toHaveBeenCalledWith(1);
  });
});
