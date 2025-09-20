/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PaymentConcept } from "../../../types/payment";
import { CommissionPaymentType } from "../../../types/commission";

/* ──────────────── Mocks ──────────────── */
vi.mock("../../../services/payment.service", () => ({
  postPayment: vi.fn(() => Promise.resolve({})),
}));
vi.mock("../../../services/commission.service", () => ({
  patchCommissionStatus: vi.fn(() => Promise.resolve({})),
}));
vi.mock("../../../services/contractUtility.service", () => ({
  getContractUtilitiesByContract: vi.fn(() => Promise.resolve([])),
}));
vi.mock("../../../services/utility.service", () => ({
  getUtilityById: vi.fn(() => Promise.resolve({ name: "Mock Utility" })),
}));

// Mock del PaymentForm: cambia `date` al escribir en el input
vi.mock("../../../components/payments/PaymentForm", () => ({
  PaymentForm: ({ onChange }: any) => (
    <input
      data-testid="payment-form"
      onChange={(e) =>
        onChange?.({ date: (e.target as HTMLInputElement).value } as any)
      }
    />
  ),
}));

/* ──────────────── Importes del módulo bajo prueba y AlertProvider ──────────────── */
import { PaymentDialog } from "../../../components/payments/PaymentDialogBase";
import { AlertProvider} from "../../../../shared/context/AlertContext";

/* ──────────────── Fixtures ──────────────── */
const contract = {
  id: 1,
  commission: {
    id: 10,
    paymentType: CommissionPaymentType.CUOTAS,
    installments: 3,
    totalAmount: 3000,
    currency: "ARS",
  },
} as any;

const onClose = vi.fn();
const onSaved = vi.fn();

/* ──────────────── Tests ──────────────── */
describe("PaymentDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el Dialog y los controles iniciales", () => {
    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    expect(screen.getByRole("dialog", { name: /Registrar Pago/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alquiler" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Extra" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comisión" })).toBeInTheDocument();
    expect(screen.getByTestId("payment-form")).toBeInTheDocument();
  });

  it("prefija concept e installment cuando se pasan props", () => {
    render(
      <AlertProvider>
        <PaymentDialog
          open={true}
          contract={contract}
          onClose={onClose}
          onSaved={onSaved}
          presetConcept={PaymentConcept.COMISION}
          presetInstallment={2}
        />
      </AlertProvider>
    );

    const btn = screen.getByRole("button", { name: "Comisión" });
    expect(btn.className).toMatch(/MuiButton-contained/);
  });

  it("resetea valores al cambiar de contrato (no crashea)", () => {
    const { rerender } = render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    rerender(
      <AlertProvider>
        <PaymentDialog open={true} contract={null} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    expect(screen.getByTestId("payment-form")).toBeInTheDocument();
  });
});
