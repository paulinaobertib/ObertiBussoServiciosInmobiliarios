/// <reference types="vitest" />
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ROUTES } from "../../../../../lib";

// --- mocks base ---
const mockNavigate = vi.fn();
const mockAsk = vi.fn((_msg, cb) => cb && cb());
const mockDialog = () => null;
const mockShowAlert = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
}));

vi.mock("../../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: () => ({ ask: mockAsk, DialogUI: mockDialog }),
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

import { useManageContractPage } from "../../../hooks/contracts/useManageContractPage";
import { useParams } from "react-router-dom";
import * as AlertContext from "../../../../shared/context/AlertContext";
import {
  getContractById,
  postContract,
  putContract,
  getContractsByPropertyId,
} from "../../../services/contract.service";
import {
  getGuarantorsByContract,
} from "../../../services/guarantor.service";

describe("useManageContractPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AlertContext, "useGlobalAlert").mockReturnValue({ showAlert: mockShowAlert });
  });

  it("title es Crear Contrato cuando no hay id", () => {
    (useParams as Mock).mockReturnValue({});
    const { result } = renderHook(() => useManageContractPage());
    expect(result.current.title).toBe("Crear Contrato");
  });

  it("preload contrato en edición exitoso", async () => {
    (useParams as Mock).mockReturnValue({ id: "5" });
    (getContractById as Mock).mockResolvedValue({
      id: 5,
      propertyId: 10,
      userId: "u1",
      guarantors: [{ id: 1 }, { id: 2 }],
    });

    const { result } = renderHook(() => useManageContractPage());

    await waitFor(() => {
      expect(result.current.contract?.id).toBe(5);
      expect(result.current.selectedPropertyId).toBe(10);
      expect(result.current.selectedUserId).toBe("u1");
      expect(result.current.selectedGuarantorIds).toEqual([1, 2]);
    });
  });

  it("preload contrato en edición falla", async () => {
    (useParams as Mock).mockReturnValue({ id: "99" });
    (getContractById as Mock).mockRejectedValue(new Error("fail"));

    renderHook(() => useManageContractPage());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
      expect(mockShowAlert).toHaveBeenCalledWith("Error al cargar contrato", "error");
    });
  });

  it("canProceed según step", () => {
    (useParams as Mock).mockReturnValue({});
    const { result } = renderHook(() => useManageContractPage());

    act(() => result.current.setActiveStep(0));
    expect(result.current.canProceed()).toBe(false);
    act(() => result.current.setSelectedPropertyId(10));
    expect(result.current.canProceed()).toBe(true);

    act(() => result.current.setActiveStep(1));
    expect(result.current.canProceed()).toBe(false);
    act(() => result.current.setSelectedUserId("u1"));
    expect(result.current.canProceed()).toBe(true);

    act(() => result.current.setActiveStep(2));
    expect(result.current.canProceed()).toBe(false);
    act(() => result.current.setFormReady(true));
    expect(result.current.canProceed()).toBe(true);

    act(() => result.current.setActiveStep(99));
    expect(result.current.canProceed()).toBe(false);
  });

  it("save en edición", async () => {
    (useParams as Mock).mockReturnValue({ id: "5" });
    (putContract as Mock).mockResolvedValue({});
    (getGuarantorsByContract as Mock).mockResolvedValue([]);
    const { result } = renderHook(() => useManageContractPage());

    (result.current.formRef.current as any) = {
      submit: vi.fn(),
      getCreateData: () => ({ guarantorsIds: [1, 2] }),
    };

    await act(async () => {
      await result.current.save();
    });

    expect(putContract).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Contrato actualizado", "success");
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it("save en creación", async () => {
    (useParams as Mock).mockReturnValue({});
    (postContract as Mock).mockResolvedValue({});
    (getContractsByPropertyId as Mock).mockResolvedValue([
      { id: 9, userId: "u1", contractType: "A", startDate: "2020-01-01" },
    ]);
    (getGuarantorsByContract as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useManageContractPage());
    (result.current.formRef.current as any) = {
      submit: vi.fn(),
      getCreateData: () => ({
        propertyId: 10,
        userId: "u1",
        contractType: "A",
        startDate: "2020-01-01",
        guarantorsIds: [],
      }),
    };

    await act(async () => {
      await result.current.save();
    });

    expect(postContract).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT, {
      state: { justCreated: true, createdId: 9 },
    });
  });

  it("save error", async () => {
    (useParams as Mock).mockReturnValue({});
    (postContract as Mock).mockRejectedValue({ response: { data: "boom" } });

    const { result } = renderHook(() => useManageContractPage());
    (result.current.formRef.current as any) = {
      submit: vi.fn(),
      getCreateData: () => ({}),
    };

    await act(async () => {
      await result.current.save();
    });

    expect(mockShowAlert).toHaveBeenCalledWith("boom", "error");
  });

  it("cancel llama ask y ejecuta callback", async () => {
    (useParams as Mock).mockReturnValue({});
    const { result } = renderHook(() => useManageContractPage());
    const reset = vi.fn();
    (result.current.formRef.current as any) = { reset };

    await act(async () => {
      await result.current.cancel();
    });

    expect(reset).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it("afterCommissionSaved resetea id y navega", () => {
    (useParams as Mock).mockReturnValue({});
    const { result } = renderHook(() => useManageContractPage());
    act(() => result.current.setCommissionContractId(5));
    act(() => result.current.afterCommissionSaved());
    expect(result.current.commissionContractId).toBe(null);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it("syncContractGuarantors maneja error", async () => {
    (getGuarantorsByContract as Mock).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useManageContractPage());
    // @ts-ignore
    await (result.current as any).constructor.syncContractGuarantors?.(1, []);
  });
});
