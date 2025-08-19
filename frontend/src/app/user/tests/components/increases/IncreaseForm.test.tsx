/// <reference types="vitest" />
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { IncreaseForm } from "../../../components/increases/IncreaseForm";
import { ContractIncreaseCurrency } from "../../../types/contractIncrease";

describe("IncreaseForm", () => {
  it("emite onChange con valores por defecto al montar", () => {
    const onChange = vi.fn();
    render(<IncreaseForm onChange={onChange} />);

    const today = dayjs().format("YYYY-MM-DD");
    const defaultCurrency =
      (Object.values(ContractIncreaseCurrency)[0] as ContractIncreaseCurrency) ??
      "ARS";

    expect(onChange).toHaveBeenCalled();
    const first = onChange.mock.calls[0][0];

    expect(first).toMatchObject({
      date: today,
      amount: 0,
      currency: defaultCurrency,
      frequency: 12,
    });

    // Inputs muestran esos valores
    expect((screen.getByLabelText("Fecha") as HTMLInputElement).value).toBe(
      today
    );
    expect((screen.getByLabelText("Monto") as HTMLInputElement).value).toBe(
      "0"
    );
    // TextField select renderiza el valor visible como texto
    expect(screen.getByLabelText("Moneda")).toHaveTextContent(
      String(defaultCurrency)
    );
    expect(
      (screen.getByLabelText("Frecuencia (meses)") as HTMLInputElement).value
    ).toBe("12");
  });

  it("respeta initialValues si se proveen", () => {
    const onChange = vi.fn();
    const init = {
      date: "2025-01-15",
      amount: 750,
      currency: "USD" as ContractIncreaseCurrency,
      frequency: 6,
    };

    render(<IncreaseForm initialValues={init} onChange={onChange} />);

    // onChange llamado con initialValues
    expect(onChange).toHaveBeenCalled();
    const first = onChange.mock.calls[0][0];
    expect(first).toMatchObject(init);

    // Inputs con esos valores
    expect((screen.getByLabelText("Fecha") as HTMLInputElement).value).toBe(
      "2025-01-15"
    );
    expect((screen.getByLabelText("Monto") as HTMLInputElement).value).toBe(
      "750"
    );
    expect(screen.getByLabelText("Moneda")).toHaveTextContent("USD");
    expect(
      (screen.getByLabelText("Frecuencia (meses)") as HTMLInputElement).value
    ).toBe("6");
  });

  it("emite onChange al modificar fecha, monto, moneda y frecuencia", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IncreaseForm onChange={onChange} />);

    const date = screen.getByLabelText("Fecha") as HTMLInputElement;
    const amount = screen.getByLabelText("Monto") as HTMLInputElement;
    const currency = screen.getByLabelText("Moneda"); // combobox
    const freq = screen.getByLabelText(
      "Frecuencia (meses)"
    ) as HTMLInputElement;

    // Cambiar fecha
    fireEvent.change(date, { target: { value: "2025-09-01" } });

    // Cambiar monto
    await user.clear(amount);
    await user.type(amount, "1234");

    // Cambiar frecuencia
    await user.clear(freq);
    await user.type(freq, "3");

    // Cambiar moneda (abre el menú y elige USD)
    await user.click(currency);
    const usd = await screen.findByRole("option", { name: "USD" });
    await user.click(usd);

    // Tomar la última emisión
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toMatchObject({
      date: "2025-09-01",
      amount: 1234,
      currency: "USD",
      frequency: 3,
    });
  });
});
