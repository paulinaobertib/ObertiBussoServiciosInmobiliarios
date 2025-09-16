/// <reference types="vitest" />
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest"; // 👈 importa los matchers

import { IncreaseForm } from "../../../components/increases/IncreaseForm";
import type { PaymentCurrency } from "../../../types/payment";

describe("IncreaseForm", () => {
  it("emite onChange con valores iniciales vacíos al montar", () => {
    const onChange = vi.fn();
    render(<IncreaseForm onChange={onChange} />);

    expect(onChange).toHaveBeenCalled();
    const first = onChange.mock.calls[0][0];

    expect(first).toMatchObject({
      date: "",
      amount: "",
      currency: "",
      adjustment: "",
      note: "",
    });

    // Inputs deberían estar vacíos
    expect(screen.getByLabelText("Fecha desde que regirá")).toHaveValue("");
    expect(screen.getByLabelText("Nuevo monto")).toHaveValue(null);
    expect(screen.getByLabelText("Porcentaje de ajuste")).toHaveValue(null);
    expect(screen.getByLabelText("Nota (opcional)")).toHaveValue("");
  });

  it("respeta initialValues si se proveen", () => {
    const onChange = vi.fn();
    const init = {
      date: "2025-01-15",
      amount: 750,
      currency: "USD" as PaymentCurrency,
      adjustment: 10,
      note: "Prueba",
    };

    render(<IncreaseForm initialValues={init} onChange={onChange} />);

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toMatchObject(init);

    expect(screen.getByLabelText("Fecha desde que regirá")).toHaveValue("2025-01-15");
    expect(screen.getByLabelText("Nuevo monto")).toHaveValue(750);
    expect(screen.getByLabelText("Porcentaje de ajuste")).toHaveValue(10);
    expect(screen.getByLabelText("Nota (opcional)")).toHaveValue("Prueba");

    expect(screen.getByRole("combobox", { name: /Moneda/i })).toHaveTextContent(/Dólar/i);
  });

  it("emite onChange al modificar todos los campos", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IncreaseForm onChange={onChange} />);

    const date = screen.getByLabelText("Fecha desde que regirá");
    const amount = screen.getByLabelText("Nuevo monto");
    const adjustment = screen.getByLabelText("Porcentaje de ajuste");
    const note = screen.getByLabelText("Nota (opcional)");
    const currency = screen.getByRole("combobox", { name: /Moneda/i });

    fireEvent.change(date, { target: { value: "2025-09-01" } });
    await user.clear(amount);
    await user.type(amount, "1234");
    await user.clear(adjustment);
    await user.type(adjustment, "15");
    await user.clear(note);
    await user.type(note, "Observación de prueba");
    await user.click(currency);
    const usd = await screen.findByRole("option", { name: "Dólar" });
    await user.click(usd);

    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toMatchObject({
      date: "2025-09-01",
      amount: 1234,
      adjustment: 15,
      note: "Observación de prueba",
      currency: "USD",
    });
  });

});
