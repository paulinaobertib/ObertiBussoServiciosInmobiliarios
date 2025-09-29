/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useIncreaseIndexes } from "../../hooks/useIncreaseIndexes";

// --- Mocks de servicios ---
vi.mock("../../services/increaseIndex.service", () => ({
  getAllIncreaseIndexes: vi.fn(),
  getIncreaseIndexById: vi.fn(),
  getIncreaseIndexByCode: vi.fn(),
  getIncreaseIndexByName: vi.fn(),
  getContractsByIncreaseIndex: vi.fn(),
  getIncreaseIndexByContract: vi.fn(),
  postIncreaseIndex: vi.fn(),
  putIncreaseIndex: vi.fn(),
  deleteIncreaseIndex: vi.fn(),
}));

// --- Mock de useApiErrors ---
const mockHandleError = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: mockHandleError }),
}));

// --- Mock de useGlobalAlert ---
const mockAlert = {
  success: vi.fn(),
  warning: vi.fn(),
  confirm: vi.fn(),
  doubleConfirm: vi.fn().mockResolvedValue(true),
  showAlert: vi.fn(),
};
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlert,
}));

import * as service from "../../services/increaseIndex.service";

describe("useIncreaseIndexes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loadAll carga indexes", async () => {
    (service.getAllIncreaseIndexes as any).mockResolvedValue([{ id: 1, code: "A", name: "IndexA" }]);

    const { result } = renderHook(() => useIncreaseIndexes());
    const list = await result.current.loadAll();

    await waitFor(() => {
      expect(result.current.indexes).toEqual([{ id: 1, code: "A", name: "IndexA" }]);
      expect(list).toEqual([{ id: 1, code: "A", name: "IndexA" }]);
    });
  });

  it("loadAll maneja error", async () => {
    (service.getAllIncreaseIndexes as any).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useIncreaseIndexes());
    const list = await result.current.loadAll();

    await waitFor(() => {
      expect(list).toEqual([]);
      expect(result.current.indexes).toEqual([]);
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  it("fetchByText busca por nombre y código", async () => {
    (service.getIncreaseIndexByName as any).mockResolvedValue({ id: 1, code: "X", name: "ByName" });
    (service.getIncreaseIndexByCode as any).mockResolvedValue({ id: 2, code: "Y", name: "ByCode" });

    const { result } = renderHook(() => useIncreaseIndexes());
    const res = await result.current.fetchByText("q");

    expect(res).toEqual([
      { id: 1, code: "X", name: "ByName" },
      { id: 2, code: "Y", name: "ByCode" },
    ]);
  });

  it("fetchByText usa fallback local si no encuentra nada remoto", async () => {
    (service.getIncreaseIndexByName as any).mockResolvedValue(null);
    (service.getIncreaseIndexByCode as any).mockResolvedValue(null);

    const { result } = renderHook(() => useIncreaseIndexes());

    (service.getAllIncreaseIndexes as any).mockResolvedValue([
      { id: 1, code: "AAA", name: "Nombre" },
    ]);
    await result.current.loadAll();

    await waitFor(() => {
      expect(result.current.indexes).toEqual([{ id: 1, code: "AAA", name: "Nombre" }]);
    });

    const res = await result.current.fetchByText("aaa");
    expect(res).toEqual([{ id: 1, code: "AAA", name: "Nombre" }]);
  });

  it("fetchById retorna index o null", async () => {
    (service.getIncreaseIndexById as any).mockResolvedValue({ id: 10 });
    const { result } = renderHook(() => useIncreaseIndexes());
    expect(await result.current.fetchById(10)).toEqual({ id: 10 });

    (service.getIncreaseIndexById as any).mockRejectedValue(new Error("fail"));
    expect(await result.current.fetchById(99)).toBeNull();
    expect(mockHandleError).toHaveBeenCalled();
  });

  it("fetchContracts y fetchByContract funcionan", async () => {
    (service.getContractsByIncreaseIndex as any).mockResolvedValue([{ id: 1 }]);
    (service.getIncreaseIndexByContract as any).mockResolvedValue({ id: 2 });

    const { result } = renderHook(() => useIncreaseIndexes());

    expect(await result.current.fetchContracts(1)).toEqual([{ id: 1 }]);
    expect(await result.current.fetchByContract(1)).toEqual({ id: 2 });
  });

  it("create retorna index creado si coincide code+name", async () => {
    (service.postIncreaseIndex as any).mockResolvedValue({});
    (service.getAllIncreaseIndexes as any).mockResolvedValue([
      { id: 1, code: "C1", name: "N1" },
    ]);

    const { result } = renderHook(() => useIncreaseIndexes());

    const created = await result.current.create({ code: "C1", name: "N1" } as any);
    expect(created).toEqual({ id: 1, code: "C1", name: "N1" });
    expect(mockAlert.success).toHaveBeenCalled();
  });

  it("update y remove retornan true en éxito, false en error", async () => {
    (service.putIncreaseIndex as any).mockResolvedValue({});
    (service.deleteIncreaseIndex as any).mockResolvedValue({});
    (service.getAllIncreaseIndexes as any).mockResolvedValue([]);

    const { result } = renderHook(() => useIncreaseIndexes());

    expect(await result.current.update({ id: 1 } as any)).toBe(true);
    expect(await result.current.remove(1)).toBe(true);

    (service.putIncreaseIndex as any).mockRejectedValue(new Error("fail"));
    expect(await result.current.update({ id: 1 } as any)).toBe(false);
    expect(mockHandleError).toHaveBeenCalled();
  });

  it("create retorna null en error", async () => {
    (service.postIncreaseIndex as any).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useIncreaseIndexes());
    expect(await result.current.create({ code: "X", name: "Y" } as any)).toBeNull();
  });
});
