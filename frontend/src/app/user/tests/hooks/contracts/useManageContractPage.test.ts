/// <reference types="vitest" />
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useManageContractPage } from "../../../hooks/contracts/useManageContractPage";
import { ROUTES } from "../../../../../lib";

// --- Mocks ---
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: vi.fn() }),
}));
vi.mock("../../../services/contract.service", () => ({
  getContractById: vi.fn(),
  postContract: vi.fn(),
  putContract: vi.fn(),
  getContractsByPropertyId: vi.fn(),
}));
vi.mock("../../../services/guarantor.service", () => ({
  getGuarantorsByContract: vi.fn(),
  addGuarantorToContract: vi.fn(),
  removeGuarantorFromContract: vi.fn(),
}));

import { useNavigate, useParams } from "react-router-dom";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import {
  getContractById,
  postContract,
  putContract,
  getContractsByPropertyId,
} from "../../../services/contract.service";
import {
  getGuarantorsByContract,
  addGuarantorToContract,
  removeGuarantorFromContract,
} from "../../../services/guarantor.service";

// helpers
const navigate = vi.fn();
const success = vi.fn();
const confirm = vi.fn();
const doubleConfirm = vi.fn();
const showAlert = vi.fn();

describe("useManageContractPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(navigate);
    (useGlobalAlert as any).mockReturnValue({
      success,
      confirm,
      doubleConfirm,
      showAlert,
    });
  });

  it("inicia en modo crear (sin id)", () => {
    (useParams as any).mockReturnValue({});
    const { result } = renderHook(() => useManageContractPage());
    expect(result.current.title).toBe("Crear Contrato");
    expect(result.current.loading).toBe(false);
  });

  it("preload en edición carga contrato y garantes", async () => {
    (useParams as any).mockReturnValue({ id: "10" });
    (getContractById as any).mockResolvedValue({
      id: 10,
      propertyId: 5,
      userId: "u1",
      guarantors: [{ id: 99 }],
    });
    (getGuarantorsByContract as any).mockResolvedValue([{ id: 99 }]);

    const { result } = renderHook(() => useManageContractPage());

    await waitFor(() => {
      expect(result.current.contract?.id).toBe(10);
      expect(result.current.selectedPropertyId).toBe(5);
      expect(result.current.selectedUserId).toBe("u1");
      expect(result.current.selectedGuarantorIds).toEqual([99]);
    });
  });

  it("preload maneja error y redirige", async () => {
    (useParams as any).mockReturnValue({ id: "20" });
    (getContractById as any).mockRejectedValue(new Error("fail"));

    renderHook(() => useManageContractPage());

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
    });
  });

  it("canProceed depende del step", () => {
    (useParams as any).mockReturnValue({});
    const { result } = renderHook(() => useManageContractPage());

    // step 0: property
    act(() => {
      result.current.setSelectedPropertyId(5);
    });
    expect(result.current.canProceed()).toBe(true);

    // step 1: user
    act(() => {
      result.current.setActiveStep(1);
      result.current.setSelectedUserId("u1");
    });
    expect(result.current.canProceed()).toBe(true);

    // step 2: form
    act(() => {
      result.current.setActiveStep(2);
      result.current.setFormReady(true);
    });
    expect(result.current.canProceed()).toBe(true);
  });

  it("save crea contrato nuevo y redirige con justCreated", async () => {
    (useParams as any).mockReturnValue({});
    (postContract as any).mockResolvedValue({});
    (getContractsByPropertyId as any).mockResolvedValue([
      { id: 1, userId: "u1", contractType: "TEMPORAL", startDate: "2023-01-01" },
    ]);
    (getGuarantorsByContract as any).mockResolvedValue([]);

    const { result } = renderHook(() => useManageContractPage());
    // simular formRef
    result.current.formRef.current = {
      submit: vi.fn(),
      reset: vi.fn(),
      getCreateData: () => ({
        propertyId: 1,
        userId: "u1",
        contractType: "TEMPORAL",
        startDate: "2023-01-01",
        guarantorsIds: [],
      }),
    } as any;

    await act(async () => {
      await result.current.save();
    });

    expect(postContract).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ROUTES.CONTRACT, {
      state: { justCreated: true, createdId: 1 },
    });
  });

  it("save actualiza contrato existente", async () => {
    (useParams as any).mockReturnValue({ id: "55" });
    (getContractById as any).mockResolvedValue({ id: 55, propertyId: 1, userId: "u1" });
    (putContract as any).mockResolvedValue({});
    (getGuarantorsByContract as any).mockResolvedValue([]);
    (addGuarantorToContract as any).mockResolvedValue({});
    (removeGuarantorFromContract as any).mockResolvedValue({});

    const { result } = renderHook(() => useManageContractPage());
    result.current.formRef.current = {
      submit: vi.fn(),
      reset: vi.fn(),
      getCreateData: () => ({
        propertyId: 1,
        userId: "u1",
        contractType: "TEMPORAL",
        startDate: "2023-01-01",
        guarantorsIds: [99],
      }),
    } as any;

    await waitFor(() => expect(result.current.contract).not.toBeNull());

    await act(async () => {
      await result.current.save();
    });

    expect(putContract).toHaveBeenCalledWith(55, expect.any(Object));
    expect(success).toHaveBeenCalledWith(expect.objectContaining({ title: "Contrato actualizado" }));
    expect(navigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it("cancel pide confirmación y navega si ok", async () => {
    (useParams as any).mockReturnValue({});
    doubleConfirm.mockResolvedValue(true);

    const { result } = renderHook(() => useManageContractPage());
    result.current.formRef.current = { reset: vi.fn() } as any;

    await act(async () => {
      await result.current.cancel();
    });

    expect(navigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it("afterCommissionSaved limpia commissionContractId y navega", () => {
    (useParams as any).mockReturnValue({});
    const { result } = renderHook(() => useManageContractPage());

    act(() => {
      result.current.setCommissionContractId(123);
      result.current.afterCommissionSaved();
    });

    expect(result.current.commissionContractId).toBeNull();
    expect(navigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });
});
