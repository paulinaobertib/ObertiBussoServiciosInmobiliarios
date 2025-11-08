/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  postContractUtilityIncrease,
  putContractUtilityIncrease,
  deleteContractUtilityIncrease,
  getContractUtilityIncreases,
} from "../../services/contractUtilityIncrease.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
import { api } from "../../../../api";

describe("contractUtilityIncrease.service", () => {
  const cred = { withCredentials: true };
  const resp = (data: any) => ({ data });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("postContractUtilityIncrease: POST /users/contractUtilityIncreases/create", async () => {
    (api.post as any).mockResolvedValueOnce(resp("ok"));
    const body = { contractUtilityId: 1, adjustmentDate: "2025-01-01", amount: 100 } as any;
    const r = await postContractUtilityIncrease(body);
    expect(api.post).toHaveBeenCalledWith("/users/contractUtilityIncreases/create", body, cred);
    expect(r).toBe("ok");
  });

  it("putContractUtilityIncrease: PUT /users/contractUtilityIncreases/update", async () => {
    (api.put as any).mockResolvedValueOnce(resp("ok"));
    const r = await putContractUtilityIncrease({ id: 9 } as any);
    expect(api.put).toHaveBeenCalledWith("/users/contractUtilityIncreases/update", { id: 9 }, cred);
    expect(r).toBe("ok");
  });

  it("deleteContractUtilityIncrease: DELETE /users/contractUtilityIncreases/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp("ok"));
    const r = await deleteContractUtilityIncrease(7);
    expect(api.delete).toHaveBeenCalledWith("/users/contractUtilityIncreases/delete/7", cred);
    expect(r).toBe("ok");
  });

  it("getContractUtilityIncreases: GET /users/contractUtilityIncreases/getByContractUtility/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));
    const r = await getContractUtilityIncreases(3);
    expect(api.get).toHaveBeenCalledWith("/users/contractUtilityIncreases/getByContractUtility/3", cred);
    expect(r).toEqual([{ id: 1 }]);
  });
});
