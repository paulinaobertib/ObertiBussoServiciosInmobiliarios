/// <reference types="vitest" />
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { useContractHistory } from "../../../hooks/contracts/useContractHistory";

// --- Mocks ---
vi.mock("../../../services/payment.service", () => ({
  getPaymentsByContractId: vi.fn(),
}));
vi.mock("../../../services/contractIncrease.service", () => ({
  getContractIncreasesByContract: vi.fn(),
}));

import { getPaymentsByContractId } from "../../../services/payment.service";
import { getContractIncreasesByContract } from "../../../services/contractIncrease.service";

describe("useContractHistory", () => {
  const fakeContract = { id: 123 } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no hace nada si contract es null", async () => {
    const { result } = renderHook(() => useContractHistory(null, 0));

    // Nada de llamadas
    expect(getPaymentsByContractId).not.toHaveBeenCalled();
    expect(getContractIncreasesByContract).not.toHaveBeenCalled();

    // Y estados iniciales
    expect(result.current.payments).toEqual([]);
    expect(result.current.increases).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("carga payments e increases cuando hay contract", async () => {
    (getPaymentsByContractId as Mock).mockResolvedValue([{ id: 1 }]);
    (getContractIncreasesByContract as Mock).mockResolvedValue([{ id: 10 }]);

    const { result } = renderHook(() => useContractHistory(fakeContract, 0));

    // al inicio
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(getPaymentsByContractId).toHaveBeenCalledWith(123);
      expect(getContractIncreasesByContract).toHaveBeenCalledWith(123);
      expect(result.current.payments).toEqual([{ id: 1 }]);
      expect(result.current.increases).toEqual([{ id: 10 }]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("recarga cuando cambia refreshFlag", async () => {
    (getPaymentsByContractId as Mock).mockResolvedValue([{ id: 2 }]);
    (getContractIncreasesByContract as Mock).mockResolvedValue([{ id: 20 }]);

    const { rerender, result } = renderHook(
      ({ flag }) => useContractHistory(fakeContract, flag),
      { initialProps: { flag: 0 } }
    );

    await waitFor(() => {
      expect(result.current.payments).toEqual([{ id: 2 }]);
    });

    // Cambiamos flag
    (getPaymentsByContractId as Mock).mockResolvedValue([{ id: 3 }]);
    (getContractIncreasesByContract as Mock).mockResolvedValue([{ id: 30 }]);

    rerender({ flag: 1 });

    await waitFor(() => {
      expect(result.current.payments).toEqual([{ id: 3 }]);
      expect(result.current.increases).toEqual([{ id: 30 }]);
    });
  });
});
