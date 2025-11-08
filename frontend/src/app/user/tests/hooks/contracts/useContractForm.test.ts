/// <reference types="vitest" />
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { useContractForm } from "../../../hooks/contracts/useContractForm";
import { ContractStatus, ContractType } from "../../../types/contract";

// --- Mocks servicios ---
vi.mock("../../../../property/services/property.service", () => ({
  getPropertyById: vi.fn(),
}));
vi.mock("../../../../user/services/user.service", () => ({
  getUserById: vi.fn(),
}));

import { getPropertyById } from "../../../../property/services/property.service";
import { getUserById } from "../../../../user/services/user.service";

describe("useContractForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const propertyMock = { id: 10, name: "Propiedad" };
  const userMock = { id: "u1", name: "Juan" };

  it("inicializa con valores vacíos cuando no hay initialData", () => {
    const { result } = renderHook(() => useContractForm(1, "u1"));
    expect(result.current.values.propertyId).toBe(1);
    expect(result.current.values.userId).toBe("u1");
    expect(result.current.errors).toBeDefined();
  });

  it("inicializa con initialData", () => {
    const initialData = {
      propertyId: 2,
      userId: "u2",
      contractType: ContractType.VIVIENDA,
      contractStatus: ContractStatus.ACTIVO,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      adjustmentFrequencyMonths: 6,
      initialAmount: 1000,
      currency: "ARS",
      note: "nota",
      hasDeposit: true,
      depositAmount: 500,
      depositNote: "dep",
      guarantors: [{ id: 5 }],
    } as any;

    const { result } = renderHook(() => useContractForm(0, "x", initialData));

    expect(result.current.values.propertyId).toBe(2);
    expect(result.current.values.userId).toBe("u2");
    expect(result.current.values.contractType).toBe(ContractType.VIVIENDA);
    expect(result.current.values.guarantorsIds).toEqual([5]);
  });

  it("carga property y user correctamente", async () => {
    (getPropertyById as Mock).mockResolvedValue(propertyMock);
    (getUserById as Mock).mockResolvedValue({ data: userMock });

    const { result } = renderHook(() => useContractForm(1, "u1"));

    await waitFor(() => {
      expect(result.current.property).toEqual(propertyMock);
      expect(result.current.user).toEqual(userMock);
      expect(result.current.loadingData).toBe(false);
    });
  });

  it("maneja error en carga de property/user", async () => {
    (getPropertyById as Mock).mockRejectedValue(new Error("fail"));
    (getUserById as Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useContractForm(1, "u1"));

    await waitFor(() => {
      expect(result.current.property).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.loadingData).toBe(false);
    });
  });

  it("valida y devuelve errores cuando campos inválidos", async () => {
    const onValidity = vi.fn();
    const { result } = renderHook(() => useContractForm(1, "u1", undefined, onValidity));

    await waitFor(() => {
      expect(onValidity).toHaveBeenCalledWith(false);
      expect(result.current.errors).toBeTruthy();
    });
  });

  it("submit retorna null si la validación falla", async () => {
    const { result } = renderHook(() => useContractForm(1, "u1"));
    let output: any;
    await act(async () => {
      output = await result.current.submit();
    });
    expect(output).toBeNull();
  });

  it("submit retorna DTO válido cuando no hay errores", async () => {
    const validData = {
      propertyId: 1,
      userId: "u1",
      contractType: ContractType.COMERCIAL,
      contractStatus: ContractStatus.ACTIVO,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      adjustmentFrequencyMonths: 6,
      initialAmount: 1000,
      currency: "ARS",
    } as any;

    const { result } = renderHook(() => useContractForm(1, "u1", validData));

    let output: any;
    await act(async () => {
      output = await result.current.submit();
    });

    expect(output).toMatchObject({
      contractType: ContractType.COMERCIAL,
      contractStatus: ContractStatus.ACTIVO,
      initialAmount: 1000,
      adjustmentFrequencyMonths: 6,
    });
  });

  it("reset vuelve a valores iniciales", () => {
    const { result } = renderHook(() => useContractForm(1, "u1"));
    act(() => {
      result.current.reset();
    });
    expect(result.current.values.contractType).toBe("");
    expect(result.current.values.contractStatus).toBe("");
  });

  it("handleChange actualiza valores", () => {
    const { result } = renderHook(() => useContractForm(1, "u1"));
    act(() => {
      result.current.handleChange("note")({
        target: { value: "nueva nota" },
      } as any);
    });
    expect(result.current.values.note).toBe("nueva nota");
  });

  it("setExtras actualiza extras", () => {
    const { result } = renderHook(() => useContractForm(1, "u1"));
    act(() => {
      result.current.setExtras({
        note: "nota",
        hasDeposit: true,
        depositAmount: 500,
        depositNote: "dep",
      });
    });
    expect(result.current.values.hasDeposit).toBe(true);
    expect(result.current.values.depositAmount).toBe(500);
  });

  it("setGuarantorsIds actualiza ids", () => {
    const { result } = renderHook(() => useContractForm(1, "u1"));
    act(() => {
      result.current.setGuarantorsIds([1, 2]);
    });
    expect(result.current.values.guarantorsIds).toEqual([1, 2]);
  });

  it("getCreateData retorna DTO transformado", () => {
    const validData = {
      propertyId: 1,
      userId: "u1",
      contractType: ContractType.VIVIENDA,
      contractStatus: ContractStatus.INACTIVO,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      adjustmentFrequencyMonths: 6,
      initialAmount: 1000,
      currency: "ARS",
      hasDeposit: true,
      depositAmount: 200,
      depositNote: "d",
      adjustmentIndexId: "5",
      guarantors: [{ id: 10 }],
    } as any;

    const { result } = renderHook(() => useContractForm(1, "u1", validData));

    const dto = result.current.getCreateData();
    expect(dto).toMatchObject({
      propertyId: 1,
      userId: "u1",
      contractType: ContractType.VIVIENDA,
      contractStatus: ContractStatus.INACTIVO,
      depositAmount: 200,
      adjustmentIndexId: 5,
      guarantorsIds: [10],
    });
  });
});
