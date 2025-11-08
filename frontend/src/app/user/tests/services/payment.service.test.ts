/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  postPayment,
  putPayment,
  deletePayment,
  getPaymentById,
  getPaymentsByContractId,
  getPaymentsByCommissionId,
  getAllPayments,
  getPaymentsByDateRange,
  getPaymentsByContractRange,
  getPaymentsByCommissionRange,
  getPaymentsByUtilityRange,
  getPaymentsByConcept,
  getPaymentsByCurrency,
  getPaymentsMonthlyTotals,
} from "../../services/payment.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "../../../../api";

describe("payment.service", () => {
  const cred = { withCredentials: true };
  const resp = (data: any) => ({ data });

  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  /* ----------------------------- postPayment ----------------------------- */
  it("postPayment: POST /users/payments/create con body y withCredentials", async () => {
    const body = { contractId: 1, amount: 1000, date: "2025-01-01" } as any;
    (api.post as any).mockResolvedValueOnce(resp({ id: 10 }));

    const r = await postPayment(body);
    expect(api.post).toHaveBeenCalledWith("/users/payments/create", body, cred);
    expect(r).toEqual({ id: 10 });
  });

  it("postPayment: re-lanza y loguea", async () => {
    const boom = new Error("create payment fail");
    (api.post as any).mockRejectedValueOnce(boom);

    await expect(postPayment({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error creating payment:", boom);
  });

  /* ------------------------------ putPayment ----------------------------- */
  it("putPayment: PUT /users/payments/update con body y withCredentials", async () => {
    const body = { id: 7, amount: 2000 } as any;
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await putPayment(body);
    expect(api.put).toHaveBeenCalledWith("/users/payments/update", body, cred);
    expect(r).toEqual({ ok: true });
  });

  it("putPayment: re-lanza y loguea", async () => {
    const boom = new Error("update payment fail");
    (api.put as any).mockRejectedValueOnce(boom);

    await expect(putPayment({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error updating payment:", boom);
  });

  /* ---------------------------- deletePayment ---------------------------- */
  it("deletePayment: DELETE /users/payments/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await deletePayment({ id: 33 } as any);
    expect(api.delete).toHaveBeenCalledWith("/users/payments/delete/33", cred);
    expect(r).toEqual({ ok: true });
  });

  it("deletePayment: re-lanza y loguea", async () => {
    const boom = new Error("delete payment fail");
    (api.delete as any).mockRejectedValueOnce(boom);

    await expect(deletePayment({ id: 1 } as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error deleting payment:", boom);
  });

  /* ---------------------------- getPaymentById --------------------------- */
  it("getPaymentById: GET /users/payments/getById/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 5 }));

    const r = await getPaymentById(5);
    expect(api.get).toHaveBeenCalledWith("/users/payments/getById/5", cred);
    expect(r).toEqual({ id: 5 });
  });

  it("getPaymentById: re-lanza y loguea", async () => {
    const boom = new Error("by id fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getPaymentById(999)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payment with ID 999:", boom);
  });

  /* ----------------------- getPaymentsByContractId ----------------------- */
  it("getPaymentsByContractId: GET /users/payments/getByContract/{contractId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));

    const r = await getPaymentsByContractId(22);
    expect(api.get).toHaveBeenCalledWith("/users/payments/getByContract/22", cred);
    expect(r).toEqual([{ id: 1 }]);
  });

  it("getPaymentsByContractId: re-lanza y loguea", async () => {
    const boom = new Error("by contract fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getPaymentsByContractId(22)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments for contract 22:", boom);
  });

  /* ---------------------- getPaymentsByCommissionId ---------------------- */
  it("getPaymentsByCommissionId: GET /users/payments/getByCommission/{commissionId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 2 }]));

    const r = await getPaymentsByCommissionId(7);
    expect(api.get).toHaveBeenCalledWith("/users/payments/getByCommission/7", cred);
    expect(r).toEqual([{ id: 2 }]);
  });

  it("getPaymentsByCommissionId: re-lanza y loguea", async () => {
    const boom = new Error("by commission fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getPaymentsByCommissionId(7)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments for commission 7:", boom);
  });

  /* --------------------------- getAllPayments --------------------------- */
  it("getAllPayments: GET /users/payments/getAll", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 99 }]));

    const r = await getAllPayments();
    expect(api.get).toHaveBeenCalledWith("/users/payments/getAll", cred);
    expect(r).toEqual([{ id: 99 }]);
  });

  it("getAllPayments: error retorna [] y loguea", async () => {
    const boom = new Error("get all fail");
    (api.get as any).mockRejectedValueOnce(boom);

    const r = await getAllPayments();
    expect(r).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments:", boom);
  });

  it("getAllPayments: sin data responde []", async () => {
    (api.get as any).mockResolvedValueOnce(resp(undefined));

    const r = await getAllPayments();
    expect(r).toEqual([]);
  });

  /* ------------------------ getPaymentsByDateRange ----------------------- */
  it("getPaymentsByDateRange: GET con params from/to ajustados a rango completo", async () => {
    const from = "2024-01-01";
    const to = "2024-01-31";
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));

    const r = await getPaymentsByDateRange(from, to);
    expect(api.get).toHaveBeenCalledWith("/users/payments/getByRange", {
      params: { from: `${from}T00:00:00`, to: `${to}T23:59:59` },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: 1 }]);
  });

  it("getPaymentsByDateRange: error retorna [] y loguea", async () => {
    const boom = new Error("date range fail");
    (api.get as any).mockRejectedValueOnce(boom);

    const r = await getPaymentsByDateRange("2024-01-01", "2024-01-31");
    expect(r).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments by date range:", boom);
  });

  /* --------------------- getPaymentsByContractRange ---------------------- */
  it("getPaymentsByContractRange: GET con params", async () => {
    const from = "2024-02-01";
    const to = "2024-02-29";
    (api.get as any).mockResolvedValueOnce(resp([{ id: 2 }]));

    const r = await getPaymentsByContractRange(from, to);
    expect(api.get).toHaveBeenCalledWith("/users/payments/contractRange", {
      params: { from, to },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: 2 }]);
  });

  it("getPaymentsByContractRange: error retorna [] y loguea", async () => {
    const boom = new Error("contract range fail");
    (api.get as any).mockRejectedValueOnce(boom);

    const r = await getPaymentsByContractRange("2024-02-01", "2024-02-29");
    expect(r).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments by contract range:", boom);
  });

  /* ------------------- getPaymentsByCommissionRange --------------------- */
  it("getPaymentsByCommissionRange: GET con params", async () => {
    const from = "2024-03-01";
    const to = "2024-03-31";
    (api.get as any).mockResolvedValueOnce(resp([{ id: 3 }]));

    const r = await getPaymentsByCommissionRange(from, to);
    expect(api.get).toHaveBeenCalledWith("/users/payments/commissionRange", {
      params: { from, to },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: 3 }]);
  });

  it("getPaymentsByCommissionRange: error retorna [] y loguea", async () => {
    const boom = new Error("commission range fail");
    (api.get as any).mockRejectedValueOnce(boom);

    const r = await getPaymentsByCommissionRange("2024-03-01", "2024-03-31");
    expect(r).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments by commission range:", boom);
  });

  /* --------------------- getPaymentsByUtilityRange ---------------------- */
  it("getPaymentsByUtilityRange: GET con params", async () => {
    const from = "2024-04-01";
    const to = "2024-04-30";
    (api.get as any).mockResolvedValueOnce(resp([{ id: 4 }]));

    const r = await getPaymentsByUtilityRange(from, to);
    expect(api.get).toHaveBeenCalledWith("/users/payments/utilityRange", {
      params: { from, to },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: 4 }]);
  });

  it("getPaymentsByUtilityRange: error retorna [] y loguea", async () => {
    const boom = new Error("utility range fail");
    (api.get as any).mockRejectedValueOnce(boom);

    const r = await getPaymentsByUtilityRange("2024-04-01", "2024-04-30");
    expect(r).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments by utility range:", boom);
  });

  /* ------------------------- getPaymentsByConcept ------------------------ */
  it("getPaymentsByConcept: GET con concept param", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 5 }]));

    const r = await getPaymentsByConcept("ALQUILER" as any);
    expect(api.get).toHaveBeenCalledWith("/users/payments/getByConcept", {
      params: { concept: "ALQUILER" },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: 5 }]);
  });

  it("getPaymentsByConcept: error retorna [] y loguea", async () => {
    const boom = new Error("concept fail");
    (api.get as any).mockRejectedValueOnce(boom);

    const r = await getPaymentsByConcept("ALQUILER" as any);
    expect(r).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments by concept:", boom);
  });

  /* ------------------------- getPaymentsByCurrency ----------------------- */
  it("getPaymentsByCurrency: GET con currency param", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 6 }]));

    const r = await getPaymentsByCurrency("ARS" as any);
    expect(api.get).toHaveBeenCalledWith("/users/payments/getByCurrency", {
      params: { currency: "ARS" },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: 6 }]);
  });

  it("getPaymentsByCurrency: error retorna [] y loguea", async () => {
    const boom = new Error("currency fail");
    (api.get as any).mockRejectedValueOnce(boom);

    const r = await getPaymentsByCurrency("ARS" as any);
    expect(r).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments by currency:", boom);
  });

  /* ----------------------- getPaymentsMonthlyTotals ---------------------- */
  it("getPaymentsMonthlyTotals: GET con params completos", async () => {
    const responseData = { "2024-01": 5000 };
    (api.get as any).mockResolvedValueOnce(resp(responseData));

    const r = await getPaymentsMonthlyTotals("2024-01-01", "2024-03-31", "ARS" as any);
    expect(api.get).toHaveBeenCalledWith("/users/payments/monthlyTotals", {
      params: { from: "2024-01-01", to: "2024-03-31", currency: "ARS" },
      withCredentials: true,
    });
    expect(r).toEqual(responseData);
  });

  it("getPaymentsMonthlyTotals: error re-lanza y loguea", async () => {
    const boom = new Error("monthly totals fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getPaymentsMonthlyTotals("2024-01-01", "2024-03-31", "ARS" as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching payments monthly totals:", boom);
  });
});
