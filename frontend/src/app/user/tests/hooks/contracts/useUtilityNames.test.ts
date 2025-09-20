// src/app/user/tests/hooks/utilities/useUtilityNames.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUtilityNames } from "../../../hooks/contracts/useUtilityNames";
import { getUtilityById } from "../../../services/utility.service";

vi.mock("../../../services/utility.service", () => ({
  getUtilityById: vi.fn(),
}));

describe("useUtilityNames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve un objeto vacío cuando utilities es undefined", () => {
    const { result } = renderHook(() => useUtilityNames(undefined));
    expect(result.current).toEqual({});
  });

  it("busca nombres de utilities y los guarda en el map", async () => {
    (getUtilityById as any).mockResolvedValue({ name: "Agua" });

    const { result } = renderHook(() =>
      useUtilityNames([{ utilityId: 1 }])
    );

    await waitFor(() => {
      expect(result.current[1]).toBe("Agua");
    });
  });

it("llama al servicio aunque venga utility.name y guarda el resultado", async () => {
  (getUtilityById as any).mockResolvedValue({ name: "Luz remota" });

  const { result } = renderHook(() =>
    useUtilityNames([{ utilityId: 2, utility: { name: "Luz" } }])
  );

  await waitFor(() => {
    expect(result.current[2]).toBe("Luz remota"); // no usa "Luz" local
  });

  expect(getUtilityById).toHaveBeenCalledWith(2);
});

  it("pone el id como fallback cuando falla la request", async () => {
    (getUtilityById as any).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() =>
      useUtilityNames([{ utilityId: 3 }])
    );

    await waitFor(() => {
      expect(result.current[3]).toBe("3");
    });
  });

  it("no hace fetch de ids repetidos", async () => {
    (getUtilityById as any).mockResolvedValue({ name: "Gas" });

    const { result } = renderHook(() =>
      useUtilityNames([{ utilityId: 4 }, { utilityId: 4 }])
    );

    await waitFor(() => {
      expect(result.current[4]).toBe("Gas");
    });

    expect(getUtilityById).toHaveBeenCalledTimes(1);
  });

  it("no vuelve a pedir si ya está en el map", async () => {
    (getUtilityById as any).mockResolvedValue({ name: "Internet" });

    const { result, rerender } = renderHook(
      ({ list }) => useUtilityNames(list),
      { initialProps: { list: [{ utilityId: 5 }] } }
    );

    await waitFor(() => {
      expect(result.current[5]).toBe("Internet");
    });

    // re-render con el mismo id
    rerender({ list: [{ utilityId: 5 }] });

    expect(getUtilityById).toHaveBeenCalledTimes(1);
  });
});
