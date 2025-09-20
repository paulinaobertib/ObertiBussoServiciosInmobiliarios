/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  postGuarantor,
  putGuarantor,
  deleteGuarantor,
  getGuarantorById,
  getAllGuarantors,
  getGuarantorsByContract,
  getContractsByGuarantor,
  getGuarantorByEmail,
  getGuarantorByPhone,
  searchGuarantors,
  addGuarantorToContract,
  removeGuarantorFromContract,
} from "../../services/guarantor.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
import { api } from "../../../../api";

describe("guarantor.service", () => {
  const cred = { withCredentials: true };
  const resp = (data: any) => ({ data });

  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it("postGuarantor: POST /users/guarantors/create", async () => {
    (api.post as any).mockResolvedValueOnce(resp("ok"));
    const r = await postGuarantor({ name: "G" } as any);
    expect(api.post).toHaveBeenCalledWith("/users/guarantors/create", { name: "G" }, cred);
    expect(r).toBe("ok");
  });

  it("postGuarantor: error -> re-lanza y loguea", async () => {
    const boom = new Error("create fail");
    (api.post as any).mockRejectedValueOnce(boom);
    await expect(postGuarantor({} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error creating guarantor:", boom);
  });

  it("putGuarantor: PUT /users/guarantors/update/{id}", async () => {
    (api.put as any).mockResolvedValueOnce(resp("ok"));
    const r = await putGuarantor(9, { name: "X" } as any);
    expect(api.put).toHaveBeenCalledWith("/users/guarantors/update/9", { name: "X" }, cred);
    expect(r).toBe("ok");
  });

  it("putGuarantor: error -> re-lanza y loguea", async () => {
    const boom = new Error("update fail");
    (api.put as any).mockRejectedValueOnce(boom);
    await expect(putGuarantor(1, {} as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error updating guarantor:", boom);
  });

  it("deleteGuarantor: DELETE /users/guarantors/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp("ok"));
    const r = await deleteGuarantor(4);
    expect(api.delete).toHaveBeenCalledWith("/users/guarantors/delete/4", cred);
    expect(r).toBe("ok");
  });

  it("deleteGuarantor: error -> re-lanza y loguea", async () => {
    const boom = new Error("del fail");
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(deleteGuarantor(4)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error deleting guarantor:", boom);
  });

  it("getGuarantorById: GET /users/guarantors/getById/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 3 }));
    const r = await getGuarantorById(3);
    expect(api.get).toHaveBeenCalledWith("/users/guarantors/getById/3", cred);
    expect(r).toEqual({ id: 3 });
  });

  it("getGuarantorById: error -> re-lanza y loguea", async () => {
    const boom = new Error("by id fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getGuarantorById(3)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching guarantor with ID 3:", boom);
  });

  it("getAllGuarantors: GET /users/guarantors/getAll", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));
    const r = await getAllGuarantors();
    expect(api.get).toHaveBeenCalledWith("/users/guarantors/getAll", cred);
    expect(r).toEqual([{ id: 1 }]);
  });

  it("getAllGuarantors: error -> re-lanza y loguea", async () => {
    const boom = new Error("all fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAllGuarantors()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching guarantors:", boom);
  });

  it("getGuarantorsByContract: GET /users/guarantors/getByContract/{cid}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 2 }]));
    const r = await getGuarantorsByContract(8);
    expect(api.get).toHaveBeenCalledWith("/users/guarantors/getByContract/8", cred);
    expect(r).toEqual([{ id: 2 }]);
  });

  it("getGuarantorsByContract: error -> re-lanza y loguea", async () => {
    const boom = new Error("by contract fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getGuarantorsByContract(8)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching guarantors for contract 8:",
      boom
    );
  });

  it("getContractsByGuarantor: GET /users/guarantors/getContracts/{gid}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 5 }]));
    const r = await getContractsByGuarantor(5);
    expect(api.get).toHaveBeenCalledWith("/users/guarantors/getContracts/5", cred);
    expect(r).toEqual([{ id: 5 }]);
  });

  it("getContractsByGuarantor: error -> re-lanza y loguea", async () => {
    const boom = new Error("by guarantor fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getContractsByGuarantor(5)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith(
      "Error fetching contracts for guarantor 5:",
      boom
    );
  });

  it("getGuarantorByEmail: GET con params {email}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 11 }));
    const r = await getGuarantorByEmail("a@b.com");
    expect(api.get).toHaveBeenCalledWith("/users/guarantors/getByEmail", {
      params: { email: "a@b.com" },
      withCredentials: true,
    });
    expect(r).toEqual({ id: 11 });
  });

  it("getGuarantorByEmail: error -> re-lanza y loguea", async () => {
    const boom = new Error("email fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getGuarantorByEmail("x@y")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching guarantor by email:", boom);
  });

  it("getGuarantorByPhone: GET con params {phone}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 12 }));
    const r = await getGuarantorByPhone("123");
    expect(api.get).toHaveBeenCalledWith("/users/guarantors/getByPhone", {
      params: { phone: "123" },
      withCredentials: true,
    });
    expect(r).toEqual({ id: 12 });
  });

  it("getGuarantorByPhone: error -> re-lanza y loguea", async () => {
    const boom = new Error("phone fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getGuarantorByPhone("123")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error fetching guarantor by phone:", boom);
  });

  it("searchGuarantors: GET /users/guarantors/search con params {q}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "g" }]));
    const r = await searchGuarantors("foo");
    expect(api.get).toHaveBeenCalledWith("/users/guarantors/search", {
      params: { q: "foo" },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: "g" }]);
  });

  it("searchGuarantors: error -> re-lanza y loguea", async () => {
    const boom = new Error("search fail");
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(searchGuarantors("x")).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error searching guarantors:", boom);
  });

  it("addGuarantorToContract: POST /users/guarantors/addContracts/{gid}/{cid} con body null", async () => {
    (api.post as any).mockResolvedValueOnce(resp("ok"));
    const r = await addGuarantorToContract(2, 99);
    expect(api.post).toHaveBeenCalledWith(
      "/users/guarantors/addContracts/2/99",
      null,
      cred
    );
    expect(r).toBe("ok");
  });

  it("addGuarantorToContract: error -> re-lanza y loguea", async () => {
    const boom = new Error("link fail");
    (api.post as any).mockRejectedValueOnce(boom);
    await expect(addGuarantorToContract(1, 1)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error linking guarantor to contract:", boom);
  });

  it("removeGuarantorFromContract: DELETE /users/guarantors/removeContracts/{gid}/{cid}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp("ok"));
    const r = await removeGuarantorFromContract(2, 99);
    expect(api.delete).toHaveBeenCalledWith(
      "/users/guarantors/removeContracts/2/99",
      cred
    );
    expect(r).toBe("ok");
  });

  it("removeGuarantorFromContract: error -> re-lanza y loguea", async () => {
    const boom = new Error("unlink fail");
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(removeGuarantorFromContract(1, 1)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith("Error unlinking guarantor from contract:", boom);
  });
});
