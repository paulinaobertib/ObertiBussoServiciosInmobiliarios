/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PaymentConcept } from "../../../types/payment";

const h = vi.hoisted(() => ({
  lastProps: null as any,
}));

vi.mock("../../../components/payments/PaymentDialogBase", () => ({
  PaymentDialog: (props: any) => {
    h.lastProps = props;
    return <div data-testid="payment-dialog-mock" />;
  },
}));

import { PaymentExtrasDialog } from "../../../components/payments/PaymentExtrasDialog";

describe("PaymentExtrasDialog", () => {
  beforeEach(() => {
    h.lastProps = null;
    vi.clearAllMocks();
  });

  it("renderiza PaymentDialog y fija fixedConcept=EXTRA; mapea contractUtilityId a presetUtilityId", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    const contract = { id: 7 } as any;

    render(
      <PaymentExtrasDialog open={true} contract={contract} contractUtilityId={42} onClose={onClose} onSaved={onSaved} />
    );

    // Se renderiza el mock del PaymentDialog
    expect(screen.getByTestId("payment-dialog-mock")).toBeInTheDocument();

    // Props pasados correctamente
    expect(h.lastProps).toBeTruthy();
    expect(h.lastProps.open).toBe(true);
    expect(h.lastProps.contract).toBe(contract);
    expect(h.lastProps.onClose).toBe(onClose);
    expect(h.lastProps.onSaved).toBe(onSaved);

    // Fijos / mapeados
    expect(h.lastProps.fixedConcept).toBe(PaymentConcept.EXTRA);
    expect(h.lastProps.presetUtilityId).toBe(42);
  });

  it("cuando contractUtilityId es null/undefined, presetUtilityId queda undefined", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    const contract = { id: 99 } as any;

    const { rerender } = render(
      <PaymentExtrasDialog
        open={false}
        contract={contract}
        contractUtilityId={null}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
    expect(h.lastProps.open).toBe(false);
    expect(h.lastProps.presetUtilityId).toBeUndefined();
    expect(h.lastProps.fixedConcept).toBe(PaymentConcept.EXTRA);

    rerender(<PaymentExtrasDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />);
    expect(h.lastProps.open).toBe(true);
    expect(h.lastProps.presetUtilityId).toBeUndefined();
    expect(h.lastProps.fixedConcept).toBe(PaymentConcept.EXTRA);
  });

  it("propaga cambios en props con rerender", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    const contractA = { id: 1 } as any;
    const contractB = { id: 2 } as any;

    const { rerender } = render(
      <PaymentExtrasDialog open={true} contract={contractA} contractUtilityId={5} onClose={onClose} onSaved={onSaved} />
    );
    expect(h.lastProps.contract).toBe(contractA);
    expect(h.lastProps.presetUtilityId).toBe(5);

    rerender(
      <PaymentExtrasDialog
        open={false}
        contract={contractB}
        contractUtilityId={10}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
    expect(h.lastProps.open).toBe(false);
    expect(h.lastProps.contract).toBe(contractB);
    expect(h.lastProps.presetUtilityId).toBe(10);
    expect(h.lastProps.fixedConcept).toBe(PaymentConcept.EXTRA);
  });
});
