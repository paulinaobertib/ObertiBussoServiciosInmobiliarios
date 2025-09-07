/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentDialog } from "../../../components/payments/PaymentDialog";

// ====== Mocks ======
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, children }: any) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

const showAlert = vi.fn();
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({ showAlert }),
}));

vi.mock("../../../services/payment.service", () => ({
  postPayment: vi.fn(),
}));
import { postPayment } from "../../../services/payment.service";

// ====== Helpers ======
const fillForm = async (overrides?: {
  date?: string;
  amount?: string;
  description?: string;
  currency?: "ARS" | "USD";
}) => {
  const user = userEvent.setup();

  const date = screen.getByLabelText("Fecha") as HTMLInputElement;
  const amount = screen.getByLabelText("Monto") as HTMLInputElement;
  const description = screen.getByLabelText("Descripción") as HTMLInputElement;
  const currencyButton = screen.getByLabelText("Moneda"); 

  if (overrides?.date) {
    await user.clear(date);
    await user.type(date, overrides.date);
  }
  if (overrides?.amount) {
    await user.clear(amount);
    await user.type(amount, overrides.amount);
  }
  if (overrides?.description) {
    await user.clear(description);
    await user.type(description, overrides.description);
  }
  if (overrides?.currency) {
    await user.click(currencyButton);
    const opt = await screen.findByRole("option", { name: overrides.currency });
    await user.click(opt);
  }
};

const clickSave = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /guardar/i }));
};

// ====== Fixtures ======
const contractA = { id: 10 } as any;

describe("PaymentDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no hace nada si contract es null (Guardar)", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(
      <PaymentDialog open={true} contract={null} onClose={onClose} onSaved={onSaved} />
    );

    await clickSave();

    expect(postPayment).not.toHaveBeenCalled();
    expect(showAlert).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("botón Cancelar dispara onClose y respeta disabled mientras guarda", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSaved = vi.fn();

    let resolveFn: (v?: unknown) => void = () => {};
    (postPayment as any).mockImplementation(
      () => new Promise((res) => (resolveFn = res))
    );

    render(
      <PaymentDialog open={true} contract={contractA} onClose={onClose} onSaved={onSaved} />
    );

    await fillForm({
      date: "2025-08-21",
      amount: "1",
      description: "x",
      currency: "ARS",
    });

    // Cancelar antes de guardar
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Guardar y verificar disabled en Cancelar
    await clickSave();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();

    resolveFn({});
    await waitFor(() => {
      expect(showAlert).toHaveBeenCalledWith("Pago creado con éxito", "success");
    });
  });
});
