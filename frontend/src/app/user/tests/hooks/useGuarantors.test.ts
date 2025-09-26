/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useGuarantors } from "../../hooks/useGuarantors";

// --- Mocks de servicios ---
vi.mock("../../services/guarantor.service", () => ({
  getAllGuarantors: vi.fn(),
  searchGuarantors: vi.fn(),
  getGuarantorById: vi.fn(),
  getGuarantorByEmail: vi.fn(),
  getGuarantorByPhone: vi.fn(),
  getGuarantorsByContract: vi.fn(),
  getContractsByGuarantor: vi.fn(),
  postGuarantor: vi.fn(),
  putGuarantor: vi.fn(),
  deleteGuarantor: vi.fn(),
  addGuarantorToContract: vi.fn(),
  removeGuarantorFromContract: vi.fn(),
}));

// --- Mock de useApiErrors ---
const mockHandleError = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: mockHandleError }),
}));

// --- Mock de useGlobalAlert ---
const mockSuccess = vi.fn();
const mockInfo = vi.fn();
const mockWarning = vi.fn();
const mockDoubleConfirm = vi.fn().mockResolvedValue(true); // confirmaciones siempre true
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({
    success: mockSuccess,
    info: mockInfo,
    warning: mockWarning,
    doubleConfirm: mockDoubleConfirm,
  }),
}));

import * as service from "../../services/guarantor.service";

describe("useGuarantors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoubleConfirm.mockResolvedValue(true); // reset: confirm true
  });

  it("carga inicial con getAllGuarantors", async () => {
    (service.getAllGuarantors as any).mockResolvedValue([{ id: 1, name: "John" }]);

    const { result } = renderHook(() => useGuarantors());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.guarantors).toEqual([{ id: 1, name: "John" }]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("maneja error en carga inicial", async () => {
    (service.getAllGuarantors as any).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useGuarantors());

    await waitFor(() => {
      expect(result.current.guarantors).toEqual([]);
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  it("fetchByText carga guarantors", async () => {
    (service.searchGuarantors as any).mockResolvedValue([{ id: 2 }]);
    const { result } = renderHook(() => useGuarantors());

    const list = await result.current.fetchByText("abc");

    expect(list).toEqual([{ id: 2 }]);
    await waitFor(() => {
      expect(result.current.guarantors).toEqual([{ id: 2 }]);
    });
  });

  it("fetchById retorna objeto y maneja error", async () => {
    (service.getGuarantorById as any).mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useGuarantors());
    expect(await result.current.fetchById(1)).toEqual({ id: 1 });

    (service.getGuarantorById as any).mockRejectedValue(new Error("bad"));
    expect(await result.current.fetchById(99)).toBeNull();
    expect(mockHandleError).toHaveBeenCalled();
  });

  it("fetchByEmail y fetchByPhone funcionan", async () => {
    (service.getGuarantorByEmail as any).mockResolvedValue({ id: 10 });
    (service.getGuarantorByPhone as any).mockResolvedValue({ id: 20 });

    const { result } = renderHook(() => useGuarantors());

    expect(await result.current.fetchByEmail("a@b.com")).toEqual({ id: 10 });
    expect(await result.current.fetchByPhone("123")).toEqual({ id: 20 });
  });

  it("fetchByContract y fetchContractsByGuarantor funcionan", async () => {
    (service.getGuarantorsByContract as any).mockResolvedValue([{ id: 1 }]);
    (service.getContractsByGuarantor as any).mockResolvedValue([{ id: 2 }]);

    const { result } = renderHook(() => useGuarantors());

    expect(await result.current.fetchByContract(1)).toEqual([{ id: 1 }]);
    expect(await result.current.fetchContractsByGuarantor(1)).toEqual([{ id: 2 }]);
  });

  it("create, update, remove funcionan y refrescan", async () => {
    (service.postGuarantor as any).mockResolvedValue({});
    (service.putGuarantor as any).mockResolvedValue({});
    (service.deleteGuarantor as any).mockResolvedValue({});
    (service.getAllGuarantors as any).mockResolvedValue([]);

    const { result } = renderHook(() => useGuarantors());

    expect(await result.current.create({ name: "x" } as any)).toBe(true);
    expect(await result.current.update(1, { name: "x" } as any)).toBe(true);
    expect(await result.current.remove(1)).toBe(true);
  });

  it("linkToContract y unlinkFromContract funcionan", async () => {
    (service.addGuarantorToContract as any).mockResolvedValue({});
    (service.removeGuarantorFromContract as any).mockResolvedValue({});

    const { result } = renderHook(() => useGuarantors());

    expect(await result.current.linkToContract(1, 2)).toBe(true);
    expect(await result.current.unlinkFromContract(1, 2)).toBe(true);
  });

  it("mutations retornan false en error", async () => {
    (service.postGuarantor as any).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useGuarantors());

    expect(await result.current.create({} as any)).toBe(false);
    expect(mockHandleError).toHaveBeenCalled();
  });
});
