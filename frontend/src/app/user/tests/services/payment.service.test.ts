/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  postPayment,
  putPayment,
  deletePayment,
  getPaymentById,
  getPaymentsByContractId,
  getPaymentsByCommissionId,
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
    expect(api.post).toHaveBeenCalledWith(
      "/users/payments/create",
      body,
      cred
    );
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
    expect(api.put).toHaveBeenCalledWith(
      "/users/payments/update",
      body,
      cred
    );
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
    expect(api.delete).toHaveBeenCalledWith(
      "/users/payments/delete/33",
      cred
    );
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
    expect(api.get).toHaveBeenCalledWith(
      "/users/payments/getById/5",
      cred
    );
    expect(r).toEqual({ id: 5 });
  });

  it("getPaymentById: re-lanza y loguea", async () => {
    const boom = new Error("by id fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getPaymentById(999)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching payment with ID 999:",
      boom
    );
  });

  /* ----------------------- getPaymentsByContractId ----------------------- */
  it("getPaymentsByContractId: GET /users/payments/getByContract/{contractId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));

    const r = await getPaymentsByContractId(22);
    expect(api.get).toHaveBeenCalledWith(
      "/users/payments/getByContract/22",
      cred
    );
    expect(r).toEqual([{ id: 1 }]);
  });

  it("getPaymentsByContractId: re-lanza y loguea", async () => {
    const boom = new Error("by contract fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getPaymentsByContractId(22)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching payments for contract 22:",
      boom
    );
  });

  /* ---------------------- getPaymentsByCommissionId ---------------------- */
  it("getPaymentsByCommissionId: GET /users/payments/getByCommission/{commissionId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 2 }]));

    const r = await getPaymentsByCommissionId(7);
    expect(api.get).toHaveBeenCalledWith(
      "/users/payments/getByCommission/7",
      cred
    );
    expect(r).toEqual([{ id: 2 }]);
  });

  it("getPaymentsByCommissionId: re-lanza y loguea", async () => {
    const boom = new Error("by commission fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getPaymentsByCommissionId(7)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching payments for commission 7:",
      boom
    );
  });
});
