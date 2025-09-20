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

import { PaymentRentDialog } from "../../../components/payments/PaymentRentDialog";

describe("PaymentRentDialog", () => {
  beforeEach(() => {
    h.lastProps = null;
    vi.clearAllMocks();
  });

  it("renderiza PaymentDialog y le pasa fixedConcept=ALQUILER + props de passthrough", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    const contract = { id: 123 } as any;

    render(
      <PaymentRentDialog
        open={true}
        contract={contract}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    // Se renderizó nuestro mock del PaymentDialog
    expect(screen.getByTestId("payment-dialog-mock")).toBeInTheDocument();

    // Verifica props pasados
    expect(h.lastProps).toBeTruthy();
    expect(h.lastProps.open).toBe(true);
    expect(h.lastProps.contract).toBe(contract);
    expect(h.lastProps.onClose).toBe(onClose);
    expect(h.lastProps.onSaved).toBe(onSaved);

    // fixedConcept debe ser ALQUILER
    expect(h.lastProps.fixedConcept).toBe(PaymentConcept.ALQUILER);
  });

  it("propaga cambios en props (rerender)", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    const contractA = { id: 1 } as any;
    const contractB = { id: 2 } as any;

    const { rerender } = render(
      <PaymentRentDialog
        open={true}
        contract={contractA}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    // Primer render
    expect(h.lastProps.contract).toBe(contractA);
    expect(h.lastProps.open).toBe(true);

    // Rerender con otros props
    rerender(
      <PaymentRentDialog
        open={false}
        contract={contractB}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    expect(h.lastProps.contract).toBe(contractB);
    expect(h.lastProps.open).toBe(false);
    expect(h.lastProps.fixedConcept).toBe(PaymentConcept.ALQUILER);
  });
});
