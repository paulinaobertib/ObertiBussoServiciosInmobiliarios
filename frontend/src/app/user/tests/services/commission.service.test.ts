// src/app/user/tests/services/commission.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as commissionService from "../../../user/services/commission.service";
import { api } from "../../../../api";
import { CommissionStatus, CommissionPaymentType } from "../../../user/types/commission";
import { PaymentCurrency } from "../../../user/types/payment";

vi.mock("../../../../api", () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

describe("commission.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("postCommission success y error", async () => {
    (api.post as any).mockResolvedValue({ data: "ok" });
    expect(await commissionService.postCommission({} as any)).toBe("ok");
    expect(api.post).toHaveBeenCalledWith("/users/commissions/create", {}, { withCredentials: true });

    (api.post as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.postCommission({} as any)).rejects.toThrow("fail");
  });

  it("putCommission success y error", async () => {
    (api.put as any).mockResolvedValue({ data: "ok" });
    expect(await commissionService.putCommission({} as any)).toBe("ok");
    expect(api.put).toHaveBeenCalled();

    (api.put as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.putCommission({} as any)).rejects.toThrow("fail");
  });

  it("patchCommissionStatus success y error", async () => {
    (api.patch as any).mockResolvedValue({ data: "ok" });
    expect(await commissionService.patchCommissionStatus(1, CommissionStatus.PAGADA)).toBe("ok");
    expect(api.patch).toHaveBeenCalledWith(
      "/users/commissions/updateStatus/1",
      null,
      expect.objectContaining({ params: { status: CommissionStatus.PAGADA } })
    );

    (api.patch as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.patchCommissionStatus(1, CommissionStatus.PAGADA)).rejects.toThrow("fail");
  });

  it("deleteCommission success y error", async () => {
    (api.delete as any).mockResolvedValue({ data: "ok" });
    expect(await commissionService.deleteCommission(1)).toBe("ok");

    (api.delete as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.deleteCommission(1)).rejects.toThrow("fail");
  });

  it("getCommissionById success y error", async () => {
    (api.get as any).mockResolvedValue({ data: { id: 1 } });
    expect(await commissionService.getCommissionById(1)).toEqual({ id: 1 });

    (api.get as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.getCommissionById(1)).rejects.toThrow("fail");
  });

  it("getAllCommissions success y error", async () => {
    (api.get as any).mockResolvedValue({ data: [1, 2] });
    expect(await commissionService.getAllCommissions()).toEqual([1, 2]);

    (api.get as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.getAllCommissions()).rejects.toThrow("fail");
  });

  it("getCommissionByContractId success y error", async () => {
    (api.get as any).mockResolvedValue({ data: { id: 1 } });
    expect(await commissionService.getCommissionByContractId(99)).toEqual({ id: 1 });

    (api.get as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.getCommissionByContractId(99)).rejects.toThrow("fail");
  });

  it("getCommissionsByDate success y error", async () => {
    (api.get as any).mockResolvedValue({ data: [1] });
    expect(await commissionService.getCommissionsByDate("2025-01-01")).toEqual([1]);

    (api.get as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.getCommissionsByDate("2025-01-01")).rejects.toThrow("fail");
  });

  it("getCommissionsByDateRange success y error", async () => {
    (api.get as any).mockResolvedValue({ data: [2] });
    expect(await commissionService.getCommissionsByDateRange("a", "b")).toEqual([2]);

    (api.get as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.getCommissionsByDateRange("a", "b")).rejects.toThrow("fail");
  });

  it("getCommissionsByInstallments success y error", async () => {
    (api.get as any).mockResolvedValue({ data: [3] });
    expect(await commissionService.getCommissionsByInstallments(5)).toEqual([3]);

    (api.get as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.getCommissionsByInstallments(5)).rejects.toThrow("fail");
  });

  it("getCommissionsByStatus success y error", async () => {
    (api.get as any).mockResolvedValue({ data: [4] });
    expect(await commissionService.getCommissionsByStatus(CommissionStatus.PAGADA)).toEqual([4]);

    (api.get as any).mockRejectedValue(new Error("fail"));
    await expect(commissionService.getCommissionsByStatus(CommissionStatus.PAGADA)).rejects.toThrow("fail");
  });

  it("getCommissionsByPaymentType success y error devuelve []", async () => {
    (api.get as any).mockResolvedValue({ data: [5] });
    expect(await commissionService.getCommissionsByPaymentType(CommissionPaymentType.CUOTAS)).toEqual([5]);

    (api.get as any).mockRejectedValue(new Error("fail"));
    expect(await commissionService.getCommissionsByPaymentType(CommissionPaymentType.CUOTAS)).toEqual([]);
  });

  it("getTotalAmountByStatus success y error devuelve 0", async () => {
    (api.get as any).mockResolvedValue({ data: 123 });
    expect(await commissionService.getTotalAmountByStatus(CommissionStatus.PAGADA, PaymentCurrency.ARS)).toBe(123);

    (api.get as any).mockRejectedValue(new Error("fail"));
    expect(await commissionService.getTotalAmountByStatus(CommissionStatus.PAGADA, PaymentCurrency.ARS)).toBe(0);
  });

  it("getDateTotals success y error devuelve 0", async () => {
    (api.get as any).mockResolvedValue({ data: 321 });
    expect(await commissionService.getDateTotals("a", "b", PaymentCurrency.USD)).toBe(321);

    (api.get as any).mockRejectedValue(new Error("fail"));
    expect(await commissionService.getDateTotals("a", "b", PaymentCurrency.USD)).toBe(0);
  });

  it("getYearMonthlyTotals success y error devuelve {}", async () => {
    (api.get as any).mockResolvedValue({ data: { "2025-09": 999 } });
    expect(await commissionService.getYearMonthlyTotals(2025, PaymentCurrency.ARS)).toEqual({ "2025-09": 999 });

    (api.get as any).mockRejectedValue(new Error("fail"));
    expect(await commissionService.getYearMonthlyTotals(2025, PaymentCurrency.ARS)).toEqual({});
  });

  it("countCommissionsByStatus success y error devuelve defaults", async () => {
    (api.get as any).mockResolvedValue({ data: { PAGADA: 5, PARCIAL: 2, PENDIENTE: 1 } });
    expect(await commissionService.countCommissionsByStatus()).toEqual({ PAGADA: 5, PARCIAL: 2, PENDIENTE: 1 });

    (api.get as any).mockRejectedValue(new Error("fail"));
    expect(await commissionService.countCommissionsByStatus()).toEqual({
      PAGADA: 0,
      PARCIAL: 0,
      PENDIENTE: 0,
    });
  });
});
