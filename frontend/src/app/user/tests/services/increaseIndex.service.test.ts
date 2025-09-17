/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  postIncreaseIndex,
  putIncreaseIndex,
  deleteIncreaseIndex,
  getIncreaseIndexById,
  getAllIncreaseIndexes,
  getIncreaseIndexByName,
  getIncreaseIndexByCode,
  getContractsByIncreaseIndex,
  getIncreaseIndexByContract,
} from "../../services/increaseIndex.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
import { api } from "../../../../api";

describe("increaseIndex.service", () => {
  const cred = { withCredentials: true };
  const resp = (data: any) => ({ data });

  let errorSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("postIncreaseIndex: POST a /users/increaseIndex/create", async () => {
    (api.post as any).mockResolvedValueOnce(resp("ok"));
    const body = { name: "IPC", code: "IPC", description: "" } as any;
    const r = await postIncreaseIndex(body);
    expect(api.post).toHaveBeenCalledWith("/users/increaseIndex/create", body, cred);
    expect(r).toBe("ok");
    expect(logSpy).toHaveBeenCalled(); // el servicio hace console.log(response)
  });

  it("postIncreaseIndex: re-lanza error y loguea", async () => {
    const boom = new Error("create fail");
    (api.post as any).mockRejectedValueOnce(boom);
    await expect(postIncreaseIndex({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error creating increase index:", boom);
  });

  it("putIncreaseIndex: PUT /users/increaseIndex/update", async () => {
    (api.put as any).mockResolvedValueOnce(resp("ok"));
    const r = await putIncreaseIndex({ id: 1 } as any);
    expect(api.put).toHaveBeenCalledWith("/users/increaseIndex/update", { id: 1 }, cred);
    expect(r).toBe("ok");
  });

  it("putIncreaseIndex: error -> re-lanza y loguea", async () => {
    const boom = new Error("upd fail");
    (api.put as any).mockRejectedValueOnce(boom);
    await expect(putIncreaseIndex({ id: 1 } as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error updating increase index:", boom);
  });

  it("deleteIncreaseIndex: DELETE /users/increaseIndex/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp("ok"));
    const r = await deleteIncreaseIndex(9);
    expect(api.delete).toHaveBeenCalledWith("/users/increaseIndex/delete/9", cred);
    expect(r).toBe("ok");
  });

  it("deleteIncreaseIndex: error -> re-lanza y loguea", async () => {
    const boom = new Error("del fail");
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(deleteIncreaseIndex(1)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error deleting increase index:", boom);
  });

  it("getIncreaseIndexById: GET /users/increaseIndex/getById/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 3 }));
    const r = await getIncreaseIndexById(3);
    expect(api.get).toHaveBeenCalledWith("/users/increaseIndex/getById/3", cred);
    expect(r).toEqual({ id: 3 });
  });

  it("getIncreaseIndexById: error -> re-lanza y loguea", async () => {
    const boom = new Error("by id fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getIncreaseIndexById(77)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching increase index with ID 77:", boom);
  });

  it("getAllIncreaseIndexes: GET /users/increaseIndex/getAll", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));
    const r = await getAllIncreaseIndexes();
    expect(api.get).toHaveBeenCalledWith("/users/increaseIndex/getAll", cred);
    expect(r).toEqual([{ id: 1 }]);
  });

  it("getAllIncreaseIndexes: error -> re-lanza y loguea", async () => {
    const boom = new Error("all fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAllIncreaseIndexes()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching increase indexes:", boom);
  });

  it("getIncreaseIndexByName: GET con params {name}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 2 }));
    const r = await getIncreaseIndexByName("IPC");
    expect(api.get).toHaveBeenCalledWith("/users/increaseIndex/getByName", {
      params: { name: "IPC" },
      withCredentials: true,
    });
    expect(r).toEqual({ id: 2 });
  });

  it("getIncreaseIndexByName: error -> re-lanza y loguea", async () => {
    const boom = new Error("name fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getIncreaseIndexByName("IPC")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching increase index by name:", boom);
  });

  it("getIncreaseIndexByCode: GET con params {code}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 4 }));
    const r = await getIncreaseIndexByCode("IPC");
    expect(api.get).toHaveBeenCalledWith("/users/increaseIndex/getByCode", {
      params: { code: "IPC" },
      withCredentials: true,
    });
    expect(r).toEqual({ id: 4 });
  });

  it("getIncreaseIndexByCode: error -> re-lanza y loguea", async () => {
    const boom = new Error("code fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getIncreaseIndexByCode("IPC")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching increase index by code:", boom);
  });

  it("getContractsByIncreaseIndex: GET /users/increaseIndex/contracts/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 9 }]));
    const r = await getContractsByIncreaseIndex(9);
    expect(api.get).toHaveBeenCalledWith("/users/increaseIndex/contracts/9", cred);
    expect(r).toEqual([{ id: 9 }]);
  });

  it("getContractsByIncreaseIndex: error -> re-lanza y loguea", async () => {
    const boom = new Error("by idx fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByIncreaseIndex(1)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching contracts by increase index:", boom);
  });

  it("getIncreaseIndexByContract: GET /users/increaseIndex/getByContract/{cid}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 10 }));
    const r = await getIncreaseIndexByContract(77);
    expect(api.get).toHaveBeenCalledWith("/users/increaseIndex/getByContract/77", cred);
    expect(r).toEqual({ id: 10 });
  });

  it("getIncreaseIndexByContract: error -> re-lanza y loguea", async () => {
    const boom = new Error("by contract fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getIncreaseIndexByContract(77)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching increase index for contract 77:",
      boom
    );
  });
});
