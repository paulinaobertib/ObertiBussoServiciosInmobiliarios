/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  postContract,
  putContract,
  patchContractStatus,
  deleteContract,
  deleteContractsByProperty,
  deleteContractsByUser,
  getContractById,
  getAllContracts,
  getContractsByUserId,
  getContractsByPropertyId,
  getContractsByType,
  getContractsByStatus,
  getContractsByDate,
  getContractsByDateRange,
  getActiveContracts,
  getContractsExpiringWithin,
  getContractsEndingOn,
  getContractsEndingBetween,
} from "../../services/contract.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "../../../../api";

describe("contract.service", () => {
  const resp = (data: any, status = 200) => ({ data, status });
  const cred = { withCredentials: true };

  let errorSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    debugSpy.mockRestore();
  });

  /* ------------------------- POST ------------------------- */
  it("postContract: POST /users/contracts/create con body y withCredentials", async () => {
    const body = { foo: "bar" } as any;
    (api.post as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await postContract(body);
    expect(api.post).toHaveBeenCalledWith("/users/contracts/create", body, cred);
    expect(r).toEqual({ ok: true });
  });

  it("postContract: re-lanza y loguea", async () => {
    const boom = new Error("create fail");
    (api.post as any).mockRejectedValueOnce(boom);
    await expect(postContract({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error creating contract:", boom);
  });

  /* ------------------------- PUT ------------------------- */
  it("putContract: PUT /users/contracts/update/{id} con body, withCredentials y logs de debug", async () => {
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }, 200));
    const r = await putContract(7, { a: 1 } as any);
    expect(api.put).toHaveBeenCalledWith(
      "/users/contracts/update/7",
      { a: 1 },
      cred
    );
    expect(r).toEqual({ ok: true });

    // Debe haber logs de debug antes y después
    const calls = debugSpy.mock.calls.map((c) => String(c[0]));
    expect(calls.some((s) => s.includes("PUT /users/contracts/update"))).toBe(
      true
    );
    expect(calls.some((s) => s.includes("PUT done"))).toBe(true);
  });

  it("putContract: re-lanza y loguea status/data", async () => {
    const boom: any = { response: { status: 409, data: "conflict" } };
    (api.put as any).mockRejectedValueOnce(boom);
    await expect(putContract(1, {} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "[contract.service] Error updating contract:",
      { status: 409, data: "conflict", error: boom }
    );
  });

  /* ------------------------- PATCH ------------------------- */
  it("patchContractStatus: PATCH /users/contracts/updateStatus/{id} con null y withCredentials", async () => {
    (api.patch as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await patchContractStatus(9);
    expect(api.patch).toHaveBeenCalledWith(
      "/users/contracts/updateStatus/9",
      null,
      cred
    );
    expect(r).toEqual({ ok: true });
  });

  it("patchContractStatus: re-lanza y loguea", async () => {
    const boom = new Error("status fail");
    (api.patch as any).mockRejectedValueOnce(boom);
    await expect(patchContractStatus(9)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error updating contract status:",
      boom
    );
  });

  /* ------------------------- DELETE (id) ------------------------- */
  it("deleteContract: DELETE /users/contracts/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await deleteContract(3);
    expect(api.delete).toHaveBeenCalledWith(
      "/users/contracts/delete/3",
      cred
    );
    expect(r).toEqual({ ok: true });
  });

  it("deleteContract: re-lanza y loguea", async () => {
    const boom = new Error("del one fail");
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(deleteContract(3)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error deleting contract:",
      boom
    );
  });

  /* ------------------------- DELETE by property ------------------------- */
  it("deleteContractsByProperty: DELETE /users/contracts/deleteByProperty/{propertyId}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await deleteContractsByProperty(15);
    expect(api.delete).toHaveBeenCalledWith(
      "/users/contracts/deleteByProperty/15",
      cred
    );
    expect(r).toEqual({ ok: true });
  });

  it("deleteContractsByProperty: re-lanza y loguea", async () => {
    const boom = new Error("del prop fail");
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(deleteContractsByProperty(15)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error deleting contracts for property 15:",
      boom
    );
  });

  /* ------------------------- DELETE by user ------------------------- */
  it("deleteContractsByUser: DELETE /users/contracts/deleteByUser/{userId}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await deleteContractsByUser("u-99");
    expect(api.delete).toHaveBeenCalledWith(
      "/users/contracts/deleteByUser/u-99",
      cred
    );
    expect(r).toEqual({ ok: true });
  });

  it("deleteContractsByUser: re-lanza y loguea", async () => {
    const boom = new Error("del user fail");
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(deleteContractsByUser("u-99")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error deleting contracts for user u-99:",
      boom
    );
  });

  /* ------------------------- GET by id ------------------------- */
  it("getContractById: GET /users/contracts/getById/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 22 }));
    const r = await getContractById(22);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getById/22",
      cred
    );
    expect(r).toEqual({ id: 22 });
  });

  it("getContractById: re-lanza y loguea", async () => {
    const boom = new Error("by id fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractById(22)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contract with ID 22:",
      boom
    );
  });

  /* ------------------------- GET all ------------------------- */
  it("getAllContracts: GET /users/contracts/getAll", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));
    const r = await getAllContracts();
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getAll",
      cred
    );
    expect(r).toEqual([{ id: 1 }]);
  });

  it("getAllContracts: re-lanza y loguea", async () => {
    const boom = new Error("all fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAllContracts()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching all contracts:",
      boom
    );
  });

  /* ------------------------- GET by user ------------------------- */
  it("getContractsByUserId: GET /users/contracts/getByUser/{userId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "a" }]));
    const r = await getContractsByUserId("u1");
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getByUser/u1",
      cred
    );
    expect(r).toEqual([{ id: "a" }]);
  });

  it("getContractsByUserId: re-lanza y loguea", async () => {
    const boom = new Error("by user fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByUserId("u1")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts for user u1:",
      boom
    );
  });

  /* ------------------------- GET by property ------------------------- */
  it("getContractsByPropertyId: GET /users/contracts/getByProperty/{propertyId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "b" }]));
    const r = await getContractsByPropertyId(88);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getByProperty/88",
      cred
    );
    expect(r).toEqual([{ id: "b" }]);
  });

  it("getContractsByPropertyId: re-lanza y loguea", async () => {
    const boom = new Error("by prop fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByPropertyId(88)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts for property 88:",
      boom
    );
  });

  /* ------------------------- GET by type ------------------------- */
  it("getContractsByType: GET /users/contracts/getByType con params {type}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "t" }]));
    const r = await getContractsByType("RENT" as any);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getByType",
      { params: { type: "RENT" }, withCredentials: true }
    );
    expect(r).toEqual([{ id: "t" }]);
  });

  it("getContractsByType: re-lanza y loguea", async () => {
    const boom = new Error("by type fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByType("RENT" as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts by type:",
      boom
    );
  });

  /* ------------------------- GET by status ------------------------- */
  it("getContractsByStatus: GET /users/contracts/getByStatus con params {status}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "s" }]));
    const r = await getContractsByStatus("ACTIVE" as any);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getByStatus",
      { params: { status: "ACTIVE" }, withCredentials: true }
    );
    expect(r).toEqual([{ id: "s" }]);
  });

  it("getContractsByStatus: re-lanza y loguea", async () => {
    const boom = new Error("by status fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByStatus("ACTIVE" as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts by status:",
      boom
    );
  });

  /* ------------------------- GET by date ------------------------- */
  it("getContractsByDate: GET /users/contracts/getByDate con params {date}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "d" }]));
    const r = await getContractsByDate("2025-01-01");
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getByDate",
      { params: { date: "2025-01-01" }, withCredentials: true }
    );
    expect(r).toEqual([{ id: "d" }]);
  });

  it("getContractsByDate: re-lanza y loguea", async () => {
    const boom = new Error("by date fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByDate("2025-01-01")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts by date:",
      boom
    );
  });

  /* ------------------------- GET by date range ------------------------- */
  it("getContractsByDateRange: GET /users/contracts/getByDateRange con params {from,to}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "dr" }]));
    const r = await getContractsByDateRange("2025-01-01", "2025-12-31");
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/getByDateRange",
      { params: { from: "2025-01-01", to: "2025-12-31" }, withCredentials: true }
    );
    expect(r).toEqual([{ id: "dr" }]);
  });

  it("getContractsByDateRange: re-lanza y loguea", async () => {
    const boom = new Error("by range fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByDateRange("a", "b")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts by date range:",
      boom
    );
  });

  /* ------------------------- GET active ------------------------- */
  it("getActiveContracts: GET /users/contracts/active", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "act" }]));
    const r = await getActiveContracts();
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/active",
      cred
    );
    expect(r).toEqual([{ id: "act" }]);
  });

  it("getActiveContracts: re-lanza y loguea", async () => {
    const boom = new Error("active fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getActiveContracts()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching active contracts:",
      boom
    );
  });

  /* ------------------------- GET expiringWithin ------------------------- */
  it("getContractsExpiringWithin: GET /users/contracts/expiringWithinDays con params {days}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "ex" }]));
    const r = await getContractsExpiringWithin(45);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/expiringWithinDays",
      { params: { days: 45 }, withCredentials: true }
    );
    expect(r).toEqual([{ id: "ex" }]);
  });

  it("getContractsExpiringWithin: re-lanza y loguea", async () => {
    const boom = new Error("exp fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsExpiringWithin(1)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching expiring contracts:",
      boom
    );
  });

  /* ------------------------- GET endingOn ------------------------- */
  it("getContractsEndingOn: GET /users/contracts/endingOn con params {date}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "eo" }]));
    const r = await getContractsEndingOn("2026-03-31");
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/endingOn",
      { params: { date: "2026-03-31" }, withCredentials: true }
    );
    expect(r).toEqual([{ id: "eo" }]);
  });

  it("getContractsEndingOn: re-lanza y loguea", async () => {
    const boom = new Error("ending on fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsEndingOn("x")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching ending-on contracts:",
      boom
    );
  });

  /* ------------------------- GET endingBetween ------------------------- */
  it("getContractsEndingBetween: GET /users/contracts/endingBetween con params {from,to}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "eb" }]));
    const r = await getContractsEndingBetween("2026-01-01", "2026-12-31");
    expect(api.get).toHaveBeenCalledWith(
      "/users/contracts/endingBetween",
      { params: { from: "2026-01-01", to: "2026-12-31" }, withCredentials: true }
    );
    expect(r).toEqual([{ id: "eb" }]);
  });

  it("getContractsEndingBetween: re-lanza y loguea", async () => {
    const boom = new Error("ending between fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(
      getContractsEndingBetween("a", "b")
    ).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts ending between dates:",
      boom
    );
  });
});
