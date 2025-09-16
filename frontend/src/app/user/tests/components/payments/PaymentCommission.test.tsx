/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PaymentCommissionDialog } from "../../../components/payments/PaymentCommission";
import { PaymentDialog } from "../../../components/payments/PaymentDialogBase";
import { PaymentConcept } from "../../../types/payment";
import type { Contract } from "../../../types/contract";

// --- Mock PaymentDialog para capturar props ---
vi.mock("../../../components/payments/PaymentDialogBase", () => ({
  PaymentDialog: vi.fn(() => <div data-testid="payment-dialog" />),
}));

describe("PaymentCommissionDialog", () => {
  const contract: Contract = {
    id: 1,
    description: "Contrato prueba",
    tenantId: 10,
    landlordId: 20,
  } as any; // forzamos tipo mínimo necesario

  const onClose = vi.fn();
  const onSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza PaymentDialog con props correctas y fixedConcept COMISION", () => {
    render(
      <PaymentCommissionDialog
        open={true}
        contract={contract}
        installment={2}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    // Verificamos que PaymentDialog se llamó una vez
    expect(PaymentDialog).toHaveBeenCalledTimes(1);

    const props = (PaymentDialog as any).mock.calls[0][0];

    expect(props.open).toBe(true);
    expect(props.contract).toBe(contract);
    expect(props.onClose).toBe(onClose);
    expect(props.onSaved).toBe(onSaved);
    expect(props.fixedConcept).toBe(PaymentConcept.COMISION);
    expect(props.presetInstallment).toBe(2);
  });

  it("pasa null a presetInstallment si no se proporciona", () => {
    render(
      <PaymentCommissionDialog
        open={true}
        contract={contract}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    const props = (PaymentDialog as any).mock.calls[0][0];
    expect(props.presetInstallment).toBeNull();
  });
});
