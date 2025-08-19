/// <reference types="vitest" />
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentForm } from "../../../components/payments/PaymentForm";
import { PaymentCurrency } from "../../../types/payment";

describe("PaymentForm", () => {

  it("inicializa con initialValues si se proveen", () => {
    const onChange = vi.fn();
    const init = {
      date: "2024-12-31",
      amount: 99,
      description: "Pago inicial",
      paymentCurrency: "USD" as PaymentCurrency,
    };

    render(<PaymentForm initialValues={init} onChange={onChange} />);

    expect(onChange).toHaveBeenCalled();

    expect((screen.getByLabelText("Fecha") as HTMLInputElement).value).toBe("2024-12-31");
    expect((screen.getByLabelText("Monto") as HTMLInputElement).value).toBe("99");
    expect((screen.getByLabelText("Descripción") as HTMLInputElement).value).toBe("Pago inicial");
    // Chequear el texto visible del Select
    expect(screen.getByLabelText("Moneda")).toHaveTextContent("USD");
  });

  it("emite onChange al modificar fecha, monto, descripción y moneda", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PaymentForm onChange={onChange} />);

    const date = screen.getByLabelText("Fecha") as HTMLInputElement;
    const amount = screen.getByLabelText("Monto") as HTMLInputElement;
    const description = screen.getByLabelText("Descripción") as HTMLInputElement;
    const currency = screen.getByLabelText("Moneda"); // botón del Select

    // Cambiar Fecha
    fireEvent.change(date, { target: { value: "2025-08-20" } });

    // Cambiar Monto
    await user.clear(amount);
    await user.type(amount, "1500");

    // Cambiar Descripción
    await user.clear(description);
    await user.type(description, "Expensas Agosto");

    // Cambiar Moneda
    await user.click(currency);
    const usdOption = await screen.findByRole("option", { name: "USD" });
    await user.click(usdOption);

    // Última emisión de onChange con todo actualizado
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toMatchObject({
      date: "2025-08-20",
      amount: 1500,
      description: "Expensas Agosto",
      paymentCurrency: "USD",
    });
  });
});
