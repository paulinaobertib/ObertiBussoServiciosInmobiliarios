/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  postUtility,
  putUtility,
  deleteUtility,
  getUtilityById,
  getAllUtilities,
  getUtilityByName,
  getContractsByUtility,
  getUtilitiesByContract,
} from "../../services/utility.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "../../../../api";

describe("utility.service", () => {
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

  /* --------------------------- postUtility --------------------------- */
  it("postUtility: POST /users/utilities/create con body y withCredentials", async () => {
    const body = { id: 0, name: "Luz" } as any;
    (api.post as any).mockResolvedValueOnce(resp("CREATED"));

    const r = await postUtility(body);
    expect(api.post).toHaveBeenCalledWith("/users/utilities/create", body, cred);
    expect(r).toBe("CREATED");
  });

  it("postUtility: re-lanza y loguea", async () => {
    const boom = new Error("create fail");
    (api.post as any).mockRejectedValueOnce(boom);

    await expect(postUtility({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error creating utility:", boom);
  });

  /* --------------------------- putUtility ---------------------------- */
  it("putUtility: PUT /users/utilities/update con body y withCredentials", async () => {
    const body = { id: 5, name: "Agua" } as any;
    (api.put as any).mockResolvedValueOnce(resp("UPDATED"));

    const r = await putUtility(body);
    expect(api.put).toHaveBeenCalledWith("/users/utilities/update", body, cred);
    expect(r).toBe("UPDATED");
  });

  it("putUtility: re-lanza y loguea", async () => {
    const boom = new Error("update fail");
    (api.put as any).mockRejectedValueOnce(boom);

    await expect(putUtility({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error updating utility:", boom);
  });

  /* -------------------------- deleteUtility -------------------------- */
  it("deleteUtility: DELETE /users/utilities/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp("DELETED"));

    const r = await deleteUtility(77);
    expect(api.delete).toHaveBeenCalledWith("/users/utilities/delete/77", cred);
    expect(r).toBe("DELETED");
  });

  it("deleteUtility: re-lanza y loguea", async () => {
    const boom = new Error("delete fail");
    (api.delete as any).mockRejectedValueOnce(boom);

    await expect(deleteUtility(1)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error deleting utility:", boom);
  });

  /* -------------------------- getUtilityById ------------------------- */
  it("getUtilityById: GET /users/utilities/getById/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 9, name: "Gas" }));

    const r = await getUtilityById(9);
    expect(api.get).toHaveBeenCalledWith("/users/utilities/getById/9", cred);
    expect(r).toEqual({ id: 9, name: "Gas" });
  });

  it("getUtilityById: re-lanza y loguea", async () => {
    const boom = new Error("by id fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getUtilityById(999)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching utility with ID 999:", boom);
  });

  /* -------------------------- getAllUtilities ------------------------ */
  it("getAllUtilities: GET /users/utilities/getAll", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }, { id: 2 }]));

    const r = await getAllUtilities();
    expect(api.get).toHaveBeenCalledWith("/users/utilities/getAll", cred);
    expect(r).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("getAllUtilities: re-lanza y loguea", async () => {
    const boom = new Error("all fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getAllUtilities()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching utilities:", boom);
  });

  /* ------------------------- getUtilityByName ------------------------ */
  it("getUtilityByName: GET /users/utilities/getByName con params {name}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 3, name: "Internet" }));

    const r = await getUtilityByName("Internet");
    expect(api.get).toHaveBeenCalledWith("/users/utilities/getByName", {
      params: { name: "Internet" },
      withCredentials: true,
    });
    expect(r).toEqual({ id: 3, name: "Internet" });
  });

  it("getUtilityByName: re-lanza y loguea", async () => {
    const boom = new Error("by name fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getUtilityByName("X")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching utility by name:", boom);
  });

  /* ----------------------- getContractsByUtility --------------------- */
  it("getContractsByUtility: GET /users/utilities/contracts/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 10 }]));

    const r = await getContractsByUtility(4);
    expect(api.get).toHaveBeenCalledWith("/users/utilities/contracts/4", cred);
    expect(r).toEqual([{ id: 10 }]);
  });

  it("getContractsByUtility: re-lanza y loguea", async () => {
    const boom = new Error("contracts fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getContractsByUtility(4)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching contracts by utility:", boom);
  });

  /* --------------------- getUtilitiesByContract ---------------------- */
  it("getUtilitiesByContract: GET /users/utilities/getByContract/{contractId}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 8 }]));

    const r = await getUtilitiesByContract(25);
    expect(api.get).toHaveBeenCalledWith("/users/utilities/getByContract/25", cred);
    expect(r).toEqual([{ id: 8 }]);
  });

  it("getUtilitiesByContract: re-lanza y loguea", async () => {
    const boom = new Error("by contract fail");
    (api.get as any).mockRejectedValueOnce(boom);

    await expect(getUtilitiesByContract(25)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching utilities for contract 25:", boom);
  });
});
