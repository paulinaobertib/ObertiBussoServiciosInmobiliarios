// src/app/user/tests/hooks/usePaymentDialog.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePaymentDialog } from "../../../user/hooks/usePayments";
import { PaymentCurrency, PaymentConcept } from "../../../user/types/payment";
import { CommissionPaymentType, CommissionStatus } from "../../../user/types/commission";
import { ContractType, ContractStatus, Contract } from "../../../user/types/contract";
import type { UsePaymentDialogOptions } from "../../../user/hooks/usePayments";

// ─── Mocks ───
const mockAlert = {
  success: vi.fn(),
  error: vi.fn(),
};
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlert,
}));

vi.mock("../../../user/services/payment.service", () => ({
  postPayment: vi.fn(),
}));
vi.mock("../../../user/services/commission.service", () => ({
  patchCommissionStatus: vi.fn(),
}));
vi.mock("../../../user/services/contractUtility.service", () => ({
  getContractUtilitiesByContract: vi.fn(),
}));
vi.mock("../../../user/services/utility.service", () => ({
  getUtilityById: vi.fn(),
}));

import * as paymentService from "../../../user/services/payment.service";
import * as commissionService from "../../../user/services/commission.service";

describe("usePaymentDialog", () => {
  // contrato base que satisface Contract
  const baseContract: Contract = {
    id: 1,
    userId: "u1",
    propertyId: 1,
    contractType: ContractType.VIVIENDA,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    contractStatus: ContractStatus.ACTIVO,
    currency: PaymentCurrency.ARS,
    initialAmount: 1000,
    adjustmentFrequencyMonths: 12,
    lastPaidAmount: null,
    lastPaidDate: null,
    note: null,
    hasDeposit: false,
    depositAmount: null,
    depositNote: null,
    adjustmentIndexId: null,
    guarantorsIds: [],
  };

  // contrato enriquecido con commission y payments (cast a any)
  const contract = {
    ...baseContract,
    commission: {
      id: 5,
      currency: PaymentCurrency.ARS,
      totalAmount: 1000,
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 2,
      status: CommissionStatus.PENDIENTE,
      date: "2025-01-01",
      note: "",
      contractId: 1,
    },
    payments: [
      {
        id: 1,
        concept: PaymentConcept.COMISION,
        commissionId: 5,
        date: "2025-09-10",
        paymentCurrency: PaymentCurrency.ARS,
        amount: 500,
        description: "primer pago",
        contractId: 1,
      },
    ],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

it("resetea estado al cambiar contrato", async () => {
  const contractSinCommission = { ...contract, commission: null, payments: [] };

  const { result, rerender } = renderHook(
    (props: UsePaymentDialogOptions) => usePaymentDialog(props),
    { initialProps: { open: true, contract: contractSinCommission, onSaved: vi.fn(), onClose: vi.fn() } }
  );

  act(() => {
    result.current.setVals((prev) => ({ ...prev, description: "test" }));
  });

  rerender({ open: true, contract: { ...contractSinCommission, id: 2 }, onSaved: vi.fn(), onClose: vi.fn() });

  await waitFor(() => {
    expect(result.current.vals.description).toBe("");
    expect(result.current.commission).toBeNull();
  });
});

  it("prefija importe y moneda si concepto es COMISION", () => {
    const { result } = renderHook(() =>
      usePaymentDialog({ open: true, contract, onSaved: vi.fn(), onClose: vi.fn() })
    );

    act(() => {
      result.current.setConcept(PaymentConcept.COMISION);
    });

    expect(result.current.vals.paymentCurrency).toBe(PaymentCurrency.ARS);
    expect(result.current.vals.amount).toBeGreaterThan(0);
  });

  it("isValid chequea condiciones por concepto", () => {
    const { result } = renderHook(() =>
      usePaymentDialog({ open: true, contract, onSaved: vi.fn(), onClose: vi.fn() })
    );

    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.setConcept(PaymentConcept.EXTRA);
      result.current.setVals({
        ...result.current.vals,
        date: "2025-09-20",
        amount: 100,
        paymentCurrency: PaymentCurrency.ARS,
      });
      result.current.setSelectedUtilityId(5);
    });

    expect(result.current.isValid).toBe(true);
  });

  it("handleSave crea pago y actualiza comisión", async () => {
    (paymentService.postPayment as any).mockResolvedValue({});
    (commissionService.patchCommissionStatus as any).mockResolvedValue({});

    const onSaved = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      usePaymentDialog({ open: true, contract, onSaved, onClose })
    );

    act(() => {
      result.current.setConcept(PaymentConcept.COMISION);
      result.current.setVals({
        ...result.current.vals,
        date: "2025-09-20",
        amount: 100,
        paymentCurrency: PaymentCurrency.ARS,
      });
      result.current.setSelectedInstallment(1);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(paymentService.postPayment).toHaveBeenCalled();
    expect(commissionService.patchCommissionStatus).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("handleSave maneja error en postPayment", async () => {
    (paymentService.postPayment as any).mockRejectedValue({ message: "fail" });

    const { result } = renderHook(() =>
      usePaymentDialog({ open: true, contract, onSaved: vi.fn(), onClose: vi.fn() })
    );

    act(() => {
      result.current.setConcept(PaymentConcept.ALQUILER);
      result.current.setVals({
        ...result.current.vals,
        date: "2025-09-20",
        amount: 100,
        paymentCurrency: PaymentCurrency.ARS,
      });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockAlert.error).toHaveBeenCalled();
  });
});
