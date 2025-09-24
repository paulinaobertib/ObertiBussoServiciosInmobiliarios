// src/app/user/tests/hooks/useCommissionForm.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCommissionForm } from "../../../user/hooks/useCommissionForm";
import * as commissionService from "../../../user/services/commission.service";
import { CommissionPaymentType, CommissionStatus } from "../../../user/types/commission";
import type { Commission } from "../../../user/types/commission";

// ─── Mocks ───
const mockAlert = {
  success: vi.fn(),
  warning: vi.fn(),
  doubleConfirm: vi.fn().mockResolvedValue(true),
};

vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlert,
}));

const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

vi.mock("../../../user/services/commission.service", () => ({
  postCommission: vi.fn(),
  putCommission: vi.fn(),
  deleteCommission: vi.fn(),
}));

describe("useCommissionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (props: Parameters<typeof useCommissionForm>[0]) => {
    return renderHook(() => useCommissionForm(props));
  };

  it("inicializa en modo add con contractId", () => {
    const { result } = setup({ action: "add", contractId: 123 });
    expect(result.current.isAdd).toBe(true);
    expect(result.current.form.contractId).toBe(123);
  });

  it("inicializa en modo edit con item", () => {
    const item: Commission = {
      id: 1,
      currency: "ARS" as any,
      totalAmount: 500,
      date: "2025-09-22T00:00:00Z",
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 3,
      status: CommissionStatus.PENDIENTE,
      note: "nota",
      contractId: 9,
    };

    const { result } = setup({ action: "edit", item });
    expect(result.current.isEdit).toBe(true);
    expect(result.current.form.id).toBe(1);
    expect(result.current.form.totalAmount).toBe(500);
    expect(result.current.form.date).toBe("2025-09-22");
  });

  it("fuerza installments=1 si paymentType es COMPLETO", () => {
    const { result } = setup({ action: "add", contractId: 1 });
    act(() => {
      result.current.setForm((prev) => ({
        ...prev,
        paymentType: CommissionPaymentType.COMPLETO,
      }));
    });
    expect(result.current.form.installments).toBe(1);
  });

  it("handleField actualiza numéricos y strings", () => {
    const { result } = setup({ action: "add", contractId: 1 });

    act(() => {
      result.current.handleField("totalAmount")({
        target: { value: "200" },
      } as any);
    });
    expect(result.current.form.totalAmount).toBe(200);

    act(() => {
      result.current.handleField("note")({
        target: { value: "hola" },
      } as any);
    });
    expect(result.current.form.note).toBe("hola");
  });

  it("submit muestra warning si faltan datos", async () => {
    const { result } = setup({ action: "add", contractId: 1 });
    const ok = await act(() => result.current.submit());
    expect(ok).toBe(false);
    expect(mockAlert.warning).toHaveBeenCalled();
  });

  it("submit crea comisión en modo add", async () => {
    (commissionService.postCommission as any).mockResolvedValue({});
    const onSuccess = vi.fn();
    const { result } = setup({
      action: "add",
      contractId: 1,
      onSuccess,
    });

    act(() => {
      result.current.setForm({
        id: undefined,
        currency: "ARS" as any,
        totalAmount: 100,
        date: "2025-09-22",
        paymentType: CommissionPaymentType.CUOTAS,
        installments: 2,
        status: CommissionStatus.PENDIENTE,
        note: "x",
        contractId: 1,
      });
    });

    const ok = await act(() => result.current.submit());
    expect(ok).toBe(true);
    expect(commissionService.postCommission).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("submit edita comisión en modo edit", async () => {
    (commissionService.putCommission as any).mockResolvedValue({});
    const onSuccess = vi.fn();
    const { result } = setup({
      action: "edit",
      contractId: 1,
      item: {
        id: 9,
        currency: "ARS" as any,
        totalAmount: 100,
        date: "2025-09-22T00:00:00Z",
        paymentType: CommissionPaymentType.CUOTAS,
        installments: 1,
        status: CommissionStatus.PENDIENTE,
        note: "",
        contractId: 1,
      },
      onSuccess,
    });

    const ok = await act(() => result.current.submit());
    expect(ok).toBe(true);
    expect(commissionService.putCommission).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("submit elimina comisión en modo delete con confirmación", async () => {
    (commissionService.deleteCommission as any).mockResolvedValue({});
    mockAlert.doubleConfirm.mockResolvedValueOnce(true);

    const onSuccess = vi.fn();
    const { result } = setup({
      action: "delete",
      contractId: 1,
      item: {
        id: 5,
        currency: "ARS" as any,
        totalAmount: 100,
        date: "2025-09-22",
        paymentType: CommissionPaymentType.CUOTAS,
        installments: 1,
        status: CommissionStatus.PENDIENTE,
        note: "",
        contractId: 1,
      },
      onSuccess,
    });

    const ok = await act(() => result.current.submit());
    expect(ok).toBe(true);
    expect(commissionService.deleteCommission).toHaveBeenCalledWith(5);
    expect(mockAlert.success).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("submit delete cancelado retorna false", async () => {
    mockAlert.doubleConfirm.mockResolvedValueOnce(false);

    const { result } = setup({
      action: "delete",
      contractId: 1,
      item: {
        id: 5,
        currency: "ARS" as any,
        totalAmount: 100,
        date: "2025-09-22",
        paymentType: CommissionPaymentType.CUOTAS,
        installments: 1,
        status: CommissionStatus.PENDIENTE,
        note: "",
        contractId: 1,
      },
    });

    const ok = await act(() => result.current.submit());
    expect(ok).toBe(false);
    expect(commissionService.deleteCommission).not.toHaveBeenCalled();
  });

  it("maneja errores en submit", async () => {
    (commissionService.postCommission as any).mockRejectedValue(new Error("fail"));

    const { result } = setup({ action: "add", contractId: 1 });

    act(() => {
      result.current.setForm({
        id: undefined,
        currency: "ARS" as any,
        totalAmount: 100,
        date: "2025-09-22",
        paymentType: CommissionPaymentType.CUOTAS,
        installments: 1,
        status: CommissionStatus.PENDIENTE,
        note: "",
        contractId: 1,
      });
    });

    const ok = await act(() => result.current.submit());
    expect(ok).toBe(false);
    expect(handleErrorMock).toHaveBeenCalled();
  });
});
