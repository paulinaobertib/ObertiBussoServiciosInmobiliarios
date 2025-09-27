/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useContractUtilityIncreases } from "../../../../user/hooks/contracts/useContractUtilityIncreases";

// ---- mocks de servicios ----
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../../../user/services/contractUtilityIncrease.service", () => ({
  getContractUtilityIncreases: (...a: any[]) => mockGet(...a),
  postContractUtilityIncrease: (...a: any[]) => mockPost(...a),
  putContractUtilityIncrease: (...a: any[]) => mockPut(...a),
  deleteContractUtilityIncrease: (...a: any[]) => mockDelete(...a),
}));

// ---- mocks de alertas y errores ----
const mockAlert = {
  success: vi.fn(),
  warning: vi.fn(),
  confirm: vi.fn().mockResolvedValue(true),
  doubleConfirm: vi.fn(),
  showAlert: vi.fn(),
};
const mockHandleError = vi.fn();

vi.mock("../../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: mockHandleError }),
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlert,
}));

describe("useContractUtilityIncreases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga increases en reload()", async () => {
    mockGet.mockResolvedValueOnce([{ id: 1, value: 10 }]);

    const { result } = renderHook(() =>
      useContractUtilityIncreases(123, 0)
    );

    // esperar al efecto inicial
    await act(async () => {});

    expect(mockGet).toHaveBeenCalledWith(123);
    expect(result.current.increases).toEqual([{ id: 1, value: 10 }]);
    expect(result.current.error).toBeNull();
  });

  it("maneja error en reload()", async () => {
    mockGet.mockRejectedValueOnce(new Error("fail"));
    mockHandleError.mockReturnValue("err");

    const { result } = renderHook(() =>
      useContractUtilityIncreases(123, 0)
    );

    await act(async () => {});

    expect(result.current.increases).toEqual([]);
    expect(result.current.error).toBe("err");
  });

  it("crea increase correctamente", async () => {
    mockPost.mockResolvedValueOnce({ id: 10 });
    mockGet.mockResolvedValueOnce([]); // reload después

    const { result } = renderHook(() =>
      useContractUtilityIncreases(123, 0)
    );

    await act(async () => {
      const created = await result.current.createIncrease({
        contractUtilityId: 123,
        value: 50,
      } as any);
      expect(created).toEqual({ id: 10 });
    });

    expect(mockPost).toHaveBeenCalledWith({ contractUtilityId: 123, value: 50 });
    expect(mockAlert.success).toHaveBeenCalled();
  });

  it("no crea increase si falta contractUtilityId", async () => {
    const { result } = renderHook(() =>
      useContractUtilityIncreases(null, 0)
    );

    await act(async () => {
      const created = await result.current.createIncrease({ value: 50 } as any);
      expect(created).toBeNull();
    });

    expect(mockAlert.warning).toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("actualiza increase correctamente", async () => {
    mockPut.mockResolvedValueOnce(true);
    mockGet.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useContractUtilityIncreases(123, 0)
    );

    await act(async () => {
      const ok = await result.current.updateIncrease({ id: 1, value: 99 } as any);
      expect(ok).toBe(true);
    });

    expect(mockPut).toHaveBeenCalledWith({ id: 1, value: 99 });
    expect(mockAlert.success).toHaveBeenCalled();
  });

it("elimina increase con confirmación", async () => {
  mockDelete.mockResolvedValueOnce(true);
  mockGet.mockResolvedValueOnce([]);
  mockAlert.doubleConfirm.mockResolvedValueOnce(true); // 👈 clave

  const { result } = renderHook(() =>
    useContractUtilityIncreases(123, 0)
  );

  await act(async () => {
    const ok = await result.current.removeIncrease(55, { confirm: true });
    expect(ok).toBe(true);
  });

  expect(mockAlert.doubleConfirm).toHaveBeenCalled();
  expect(mockDelete).toHaveBeenCalledWith(55);
  expect(mockAlert.success).toHaveBeenCalled();
});

  it("no elimina si confirmación rechazada", async () => {
    mockAlert.confirm.mockResolvedValueOnce(false);

    const { result } = renderHook(() =>
      useContractUtilityIncreases(123, 0)
    );

    await act(async () => {
      const ok = await result.current.removeIncrease(55, { confirm: true });
      expect(ok).toBe(false);
    });

    expect(mockDelete).not.toHaveBeenCalled();
  });
});
