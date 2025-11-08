/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { PaymentConcept } from "../../../types/payment";
import { CommissionPaymentType } from "../../../types/commission";
import * as usePaymentsModule from "../../../hooks/usePayments";

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

// Mock del PaymentForm: registra props y propaga onChange
const paymentFormProps: any[] = [];
vi.mock("../../../components/payments/PaymentForm", () => ({
  PaymentForm: (props: any) => {
    paymentFormProps.push(props);
    const { onChange } = props;
    return (
      <input
        data-testid="payment-form"
        data-disable-amount={String(Boolean(props.disableAmount))}
        data-disable-currency={String(Boolean(props.disableCurrency))}
        data-external-concept={props.externalConcept ?? ""}
        data-external-utility={props.externalContractUtilityId ?? ""}
        onChange={(e) => onChange?.({ date: (e.target as HTMLInputElement).value } as any)}
      />
    );
  },
}));

/* ──────────────── Importes del módulo bajo prueba y AlertProvider ──────────────── */
import { PaymentDialog } from "../../../components/payments/PaymentDialogBase";
import { AlertProvider } from "../../../../shared/context/AlertContext";

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

const createDialogStub = (overrides: Partial<ReturnType<typeof usePaymentsModule.usePaymentDialog>> = {}) => {
  const base: any = {
    vals: {
      date: "2024-01-01",
      amount: 1000,
      description: "",
      paymentCurrency: "ARS",
      concept: "ALQUILER",
      contractUtilityId: "",
      commissionId: "",
    },
    setVals: vi.fn(),
    concept: PaymentConcept.ALQUILER,
    setConcept: vi.fn(),
    commission: null,
    commissionPaidCount: 0,
    commissionPayments: [] as any[],
    selectedInstallment: null,
    setSelectedInstallment: vi.fn(),
    expandedDescriptions: {} as Record<number, boolean>,
    toggleDescription: vi.fn(),
    utilities: [] as any[],
    selectedUtilityId: "",
    setSelectedUtilityId: vi.fn(),
    isValid: true,
    saving: false,
    handleSave: vi.fn(),
  };

  return { ...base, ...overrides } as ReturnType<typeof usePaymentsModule.usePaymentDialog>;
};

/* ──────────────── Tests ──────────────── */
describe("PaymentDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paymentFormProps.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("oculta el selector de conceptos cuando fixedConcept está definido", () => {
    const stub = createDialogStub({ concept: PaymentConcept.COMISION });
    const hookSpy = vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    render(
      <AlertProvider>
        <PaymentDialog
          open={true}
          contract={contract}
          onClose={onClose}
          onSaved={onSaved}
          fixedConcept={PaymentConcept.COMISION}
        />
      </AlertProvider>
    );

    expect(screen.queryByRole("button", { name: "Alquiler" })).not.toBeInTheDocument();
    expect(screen.getByTestId("payment-form")).toBeInTheDocument();
    expect(hookSpy).toHaveBeenCalled();
  });

  it("muestra la lista de servicios cuando el concepto es EXTRA", () => {
    const stub = createDialogStub({
      concept: PaymentConcept.EXTRA,
      utilities: [
        {
          id: 1,
          name: "Agua",
          periodicity: "MENSUAL",
          lastPaidDate: "2024-01-10",
          lastPaidAmount: 1250,
          utilityId: 0,
        },
      ],
    });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    expect(screen.getByText("Servicios del contrato")).toBeInTheDocument();
    const listItem = screen.getByText("Agua").closest("li");
    expect(listItem).toHaveTextContent(/Periodicidad: Mensual/);
    expect(listItem).toHaveTextContent(/Próximo:/);
  });

  it("actualiza el concepto al presionar los botones de filtro", async () => {
    const setConcept = vi.fn();
    const stub = createDialogStub({ setConcept });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    const user = userEvent.setup();

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    await user.click(screen.getByRole("button", { name: "Extra" }));
    await user.click(screen.getByRole("button", { name: "Comisión" }));

    expect(setConcept).toHaveBeenNthCalledWith(1, PaymentConcept.EXTRA);
    expect(setConcept).toHaveBeenNthCalledWith(2, PaymentConcept.COMISION);
  });

  it("muestra mensaje cuando no hay servicios en concepto EXTRA", () => {
    const stub = createDialogStub({
      concept: PaymentConcept.EXTRA,
      utilities: [],
    });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    expect(screen.getByText("No hay servicios vinculados al contrato.")).toBeInTheDocument();
  });

  it("permite seleccionar un servicio extra", async () => {
    const setSelectedUtilityId = vi.fn();
    const stub = createDialogStub({
      concept: PaymentConcept.EXTRA,
      utilities: [
        {
          id: 1,
          name: "Luz",
          periodicity: "UNICO",
          lastPaidDate: null,
          lastPaidAmount: null,
          utilityId: 0,
        },
      ],
      setSelectedUtilityId,
    });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    const user = userEvent.setup();

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    const listItem = screen.getByText("Luz").closest("li");
    const button = within(listItem as HTMLElement).getByRole("button");
    await user.click(button);

    expect(setSelectedUtilityId).toHaveBeenCalledWith(1);
  });

  it("renderiza cuotas de comisión y muestra las descripciones abiertas", () => {
    const commissionStub = {
      id: 10,
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 2,
      totalAmount: 3000,
      currency: "ARS",
    };
    const stub = createDialogStub({
      concept: PaymentConcept.COMISION,
      commission: commissionStub as any,
      commissionPaidCount: 1,
      commissionPayments: [
        {
          description: "Pago cuota 1",
          date: "2024-01-15",
        },
      ],
      selectedInstallment: 1,
      expandedDescriptions: { 1: true },
    });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    expect(screen.getByText("Cuota #1")).toBeInTheDocument();
    expect(screen.getByText("Pago cuota 1")).toBeInTheDocument();
    expect(screen.getByText(/Pagada/i)).toBeInTheDocument();
    expect(screen.getByText(/Pendiente/i)).toBeInTheDocument();
  });

  it("invoca toggleDescription al clickear el ícono de información", async () => {
    const toggleDescription = vi.fn();
    const commissionStub = {
      id: 10,
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 2,
      totalAmount: 3000,
      currency: "ARS",
    };
    const stub = createDialogStub({
      concept: PaymentConcept.COMISION,
      commission: commissionStub as any,
      commissionPaidCount: 0,
      commissionPayments: [
        {
          description: "Detalle",
          date: "2024-01-15",
        },
      ],
      toggleDescription,
    });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    const user = userEvent.setup();

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    const cuota = screen.getByText("Cuota #1");
    const listItem = cuota.closest("li");
    const buttons = within(listItem as HTMLElement).getAllByRole("button");
    const infoButton = buttons.find((btn) => btn.tagName === "BUTTON");
    await user.click(infoButton as HTMLElement);

    expect(toggleDescription).toHaveBeenCalledWith(1);
  });

  it("selecciona la cuota disponible y llama a setSelectedInstallment", async () => {
    const setSelectedInstallment = vi.fn();
    const commissionStub = {
      id: 10,
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 2,
      totalAmount: 3000,
      currency: "ARS",
    };
    const stub = createDialogStub({
      concept: PaymentConcept.COMISION,
      commission: commissionStub as any,
      commissionPaidCount: 0,
      commissionPayments: [],
      setSelectedInstallment,
    });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    const user = userEvent.setup();

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    await user.click(screen.getByText("Cuota #1"));

    expect(setSelectedInstallment).toHaveBeenCalledWith(1);
  });

  it("ejecuta handleSave cuando Guardar está habilitado", async () => {
    const handleSave = vi.fn();
    const stub = createDialogStub({ handleSave });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    const user = userEvent.setup();

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    const guardar = screen.getByRole("button", { name: "Guardar" });
    await user.click(guardar);

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it("deshabilita Guardar cuando el formulario es inválido", () => {
    const stub = createDialogStub({ isValid: false });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("deshabilita las acciones mientras se está guardando", () => {
    const stub = createDialogStub({ saving: true });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    expect(screen.getByRole("button", { name: "Guardando…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("invoca onClose al presionar Cancelar", async () => {
    const stub = createDialogStub();
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    const user = userEvent.setup();

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("pasa flags de deshabilitado al PaymentForm cuando es comisión", () => {
    const commissionStub = {
      id: 10,
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 2,
      totalAmount: 3000,
      currency: "ARS",
    };
    const stub = createDialogStub({
      concept: PaymentConcept.COMISION,
      commission: commissionStub as any,
    });
    vi.spyOn(usePaymentsModule, "usePaymentDialog").mockReturnValue(stub);

    render(
      <AlertProvider>
        <PaymentDialog open={true} contract={contract} onClose={onClose} onSaved={onSaved} />
      </AlertProvider>
    );

    const lastCall = paymentFormProps.at(-1);
    expect(lastCall?.disableAmount).toBe(true);
    expect(lastCall?.disableCurrency).toBe(true);
    expect(lastCall?.externalConcept).toBe(PaymentConcept.COMISION);
  });
});
