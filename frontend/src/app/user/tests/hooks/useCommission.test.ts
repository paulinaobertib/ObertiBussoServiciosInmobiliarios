import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCommission } from "../../../user/hooks/useCommission";
import * as commissionService from "../../../user/services/commission.service";
import { CommissionStatus } from "../../../user/types/commission";

vi.mock("../../../user/services/commission.service");

describe("useCommission", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("getCountByStatus llama a countCommissionsByStatus y devuelve resultado", async () => {
    (commissionService.countCommissionsByStatus as any).mockResolvedValueOnce({ PENDIENTE: 5 });

    const { result } = renderHook(() => useCommission());
    const out = await act(() => result.current.getCountByStatus());
    expect(out).toEqual({ PENDIENTE: 5 });
    expect(commissionService.countCommissionsByStatus).toHaveBeenCalled();
  });

  it("getAmountByStatus devuelve totales correctos y maneja error", async () => {
    (commissionService.getTotalAmountByStatus as any)
      .mockResolvedValueOnce(100) // para el primero
      .mockRejectedValueOnce(new Error("fail")); // para el segundo

    const { result } = renderHook(() => useCommission());
    const out = await act(() =>
      result.current.getAmountByStatus("ARS" as any, [CommissionStatus.PAGADA, CommissionStatus.PENDIENTE])
    );
    expect(out).toEqual({ PAGADA: 100, PENDIENTE: 0 });
    expect(commissionService.getTotalAmountByStatus).toHaveBeenCalledWith(CommissionStatus.PAGADA, "ARS");
    expect(commissionService.getTotalAmountByStatus).toHaveBeenCalledWith(CommissionStatus.PENDIENTE, "ARS");
  });

  it("getAmountByYearMonth llama a getYearMonthlyTotals", async () => {
    (commissionService.getYearMonthlyTotals as any).mockResolvedValueOnce({ "2025-09": 300 });

    const { result } = renderHook(() => useCommission());
    const out = await act(() => result.current.getAmountByYearMonth(2025, "ARS" as any));
    expect(out).toEqual({ "2025-09": 300 });
    expect(commissionService.getYearMonthlyTotals).toHaveBeenCalledWith(2025, "ARS");
  });

  it("getCountByDateRange agrupa fechas correctamente", async () => {
    const sample = [
      { date: "2025-09-18T12:00:00Z" },
      { createdAt: "2025-09-18T08:00:00Z" },
      {}, // fallback
    ];
    (commissionService.getCommissionsByDateRange as any).mockResolvedValueOnce(sample);

    const { result } = renderHook(() => useCommission());
    const out = await act(() => result.current.getCountByDateRange("2025-09-17", "2025-09-19"));
    expect(out["2025-09-18"]).toBe(2);
    expect(out["2025-09-17"]).toBe(1);

    expect(commissionService.getCommissionsByDateRange).toHaveBeenCalledWith("2025-09-17", "2025-09-19");
  });

  it("getCountByDateRange usa rangos por defecto cuando no se pasa nada", async () => {
    (commissionService.getCommissionsByDateRange as any).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCommission());
    await act(() => result.current.getCountByDateRange());
    expect(commissionService.getCommissionsByDateRange).toHaveBeenCalled();
    const [fromISO, toISO] = (commissionService.getCommissionsByDateRange as any).mock.calls[0];
    expect(fromISO).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(toISO).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
