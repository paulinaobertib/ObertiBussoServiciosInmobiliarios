/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  postContractIncrease,
  updateContractIncrease,
  deleteContractIncrease,
  getContractIncreaseById,
  getContractIncreasesByContract,
  getLastContractIncreaseByContract,
} from "../../services/contractIncrease.service";

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

describe("contractIncrease.service", () => {
  const resp = (data: any) => ({ data });
  const cred = { withCredentials: true };

  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  /* ---------------------- postContractIncrease ---------------------- */
  it("postContractIncrease: POST /users/contractIncreases/create con body y withCredentials", async () => {
    const body = { contractId: 1, date: "2025-01-01", percent: 10 };
    (api.post as any).mockResolvedValueOnce(resp({ id: 99 }));

    const r = await postContractIncrease(body as any);
    expect(api.post).toHaveBeenCalledWith(
      "/users/contractIncreases/create",
      body,
      cred
    );
    expect(r).toEqual({ id: 99 });
  });

  it("postContractIncrease: re-lanza y loguea con response.data si existe", async () => {
    const boom: any = { response: { data: "msg backend" } };
    (api.post as any).mockRejectedValueOnce(boom);

    await expect(postContractIncrease({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error creating contract increase:",
      "msg backend"
    );
  });

  it("postContractIncrease: re-lanza y loguea con error.message si no hay response.data", async () => {
    const boom = new Error("falló");
    (api.post as any).mockRejectedValueOnce(boom);

    await expect(postContractIncrease({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error creating contract increase:",
      "falló"
    );
  });

  /* ---------------------- updateContractIncrease ---------------------- */
  it("updateContractIncrease: PUT /users/contractIncreases/update con body y withCredentials", async () => {
    const body = { id: 7, contractId: 1, date: "2025-02-01", percent: 12 };
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await updateContractIncrease(body as any);
    expect(api.put).toHaveBeenCalledWith(
      "/users/contractIncreases/update",
      body,
      cred
    );
    expect(r).toEqual({ ok: true });
  });

  it("updateContractIncrease: re-lanza y loguea", async () => {
    const boom = new Error("upd fail");
    (api.put as any).mockRejectedValueOnce(boom);

    await expect(updateContractIncrease({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error updating contract increase:",
      boom
    );
  });

  /* ---------------------- deleteContractIncrease ---------------------- */
  it("deleteContractIncrease: DELETE /users/contractIncreases/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await deleteContractIncrease({ id: 55 } as any);
    expect(api.delete).toHaveBeenCalledWith(
      "/users/contractIncreases/delete/55",
      cred
    );
    expect(r).toEqual({ ok: true });
  });

  it("deleteContractIncrease: re-lanza y loguea", async () => {
    const boom = new Error("del fail");
    (api.delete as any).mockRejectedValueOnce(boom);

    await expect(deleteContractIncrease({ id: 1 } as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error deleting contract increase:",
      boom
    );
  });

  /* ---------------------- getContractIncreaseById ---------------------- */
  it("getContractIncreaseById: GET /users/contractIncreases/getById/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 3 }));

    const r = await getContractIncreaseById(3);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contractIncreases/getById/3",
      cred
    );
    expect(r).toEqual({ id: 3 });
  });

  it("getContractIncreaseById: re-lanza y loguea", async () => {
    const boom = new Error("by id fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getContractIncreaseById(9)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contract increase with ID 9:",
      boom
    );
  });

  /* ---------------------- getContractIncreasesByContract ---------------------- */
  it("getContractIncreasesByContract: GET /users/contractIncreases/getByContract/{contractId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));

    const r = await getContractIncreasesByContract(10);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contractIncreases/getByContract/10",
      cred
    );
    expect(r).toEqual([{ id: 1 }]);
  });

  it("getContractIncreasesByContract: re-lanza y loguea", async () => {
    const boom = new Error("by contract fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getContractIncreasesByContract(10)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching increases for contract 10:",
      boom
    );
  });

  /* ---------------------- getLastContractIncreaseByContract ---------------------- */
  it("getLastContractIncreaseByContract: GET /users/contractIncreases/getLast/{contractId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 77 }));

    const r = await getLastContractIncreaseByContract(22);
    expect(api.get).toHaveBeenCalledWith(
      "/users/contractIncreases/getLast/22",
      cred
    );
    expect(r).toEqual({ id: 77 });
  });

  it("getLastContractIncreaseByContract: re-lanza y loguea", async () => {
    const boom = new Error("last fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getLastContractIncreaseByContract(22)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching last increase for contract 22:",
      boom
    );
  });
});
