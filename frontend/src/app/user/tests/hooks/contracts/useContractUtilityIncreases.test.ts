/// <reference types="vitest" />
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { useContractUtilityIncreases } from "../../../hooks/contracts/useContractUtilityIncreases";
import { getContractUtilityIncreases } from "../../../services/contractUtilityIncrease.service";

vi.mock("../../../services/contractUtilityIncrease.service", () => ({
  getContractUtilityIncreases: vi.fn(),
}));

describe("useContractUtilityIncreases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no llama al servicio si contractUtilityId es null", async () => {
    renderHook(() => useContractUtilityIncreases(null));
    expect(getContractUtilityIncreases).not.toHaveBeenCalled();
  });

  it("llama al servicio y carga increases", async () => {
    (getContractUtilityIncreases as Mock).mockResolvedValue([
      { id: 1, value: 100 },
    ]);

    const { result } = renderHook(() => useContractUtilityIncreases(5));

    // durante la carga
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.increases).toEqual([{ id: 1, value: 100 }]);
      expect(result.current.loading).toBe(false);
      expect(getContractUtilityIncreases).toHaveBeenCalledWith(5);
    });
  });

  it("se vuelve a disparar cuando cambia refreshFlag", async () => {
    (getContractUtilityIncreases as Mock).mockResolvedValueOnce([
      { id: 1, value: 100 },
    ]);

    const { result, rerender } = renderHook(
      ({ flag }) => useContractUtilityIncreases(10, flag),
      { initialProps: { flag: 0 } }
    );

    await waitFor(() => expect(result.current.increases.length).toBe(1));

    (getContractUtilityIncreases as Mock).mockResolvedValueOnce([
      { id: 2, value: 200 },
    ]);

    rerender({ flag: 1 });

    await waitFor(() => {
      expect(result.current.increases).toEqual([{ id: 2, value: 200 }]);
    });
  });
});
