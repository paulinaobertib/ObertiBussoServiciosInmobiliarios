/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { PropsWithChildren, FC } from "react";
import { PaymentItem } from "../../../components/payments/PaymentItem";

vi.mock("../../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

import { useAuthContext as _useAuthContext } from "../../../context/AuthContext";
const useAuthContext = _useAuthContext as unknown as Mock;

const theme = createTheme({
  palette: { quaternary: { main: "#eef4ff" } },
});

const WithTheme: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// ─────────────────── Helpers ───────────────────
const basePayment = {
  id: 1,
  amount: 1234,
  paymentCurrency: "ARS",
  date: "2025-08-10T12:00:00.000Z",
  description: "Expensas julio",
} as any;

describe("PaymentItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto, admin = true para ver botones
    useAuthContext.mockReturnValue({ isAdmin: true });
  });

  it("oculta los botones si no es admin", () => {
    useAuthContext.mockReturnValue({ isAdmin: false });

    render(<PaymentItem payment={basePayment} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper: WithTheme,
    });

    // Los Iconos MUI exponen data-testid con el nombre del icono
    expect(screen.queryByTestId("EditIcon")).toBeNull();
    expect(screen.queryByTestId("DeleteIcon")).toBeNull();
  });

  it("muestra los botones si es admin y hay handlers", () => {
    render(<PaymentItem payment={basePayment} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper: WithTheme,
    });

    expect(screen.getByTestId("EditIcon")).toBeInTheDocument();
    expect(screen.getByTestId("DeleteIcon")).toBeInTheDocument();
  });

  it("sale de modo edición al guardar; no llama onEdit si no hubo cambios", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<PaymentItem payment={basePayment} onEdit={onEdit} />, {
      wrapper: WithTheme,
    });

    await user.click(screen.getByTestId("EditIcon").closest("button")!);

    // Guardar sin cambiar nada
    await user.click(screen.getByTestId("SaveIcon").closest("button")!);

    // Volvemos al modo lectura (aparece el texto secundario)
    expect(
      screen.getByText(`Descripción: ${basePayment.description}`)
    ).toBeInTheDocument();

    // No hubo cambios, no debe llamar onEdit
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("llama onEdit con los cambios cuando se guardan modificaciones", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<PaymentItem payment={basePayment} onEdit={onEdit} />, {
      wrapper: WithTheme,
    });

    // Entrar a edición
    await user.click(screen.getByTestId("EditIcon").closest("button")!);

    // Cambiar la descripción y el monto
    const desc = screen.getByLabelText("Descripción") as HTMLInputElement;
    const monto = screen.getByLabelText("Monto") as HTMLInputElement;

    await user.clear(desc);
    await user.type(desc, "Expensas agosto");
    await user.clear(monto);
    await user.type(monto, "1500");

    // Guardar
    await user.click(screen.getByTestId("SaveIcon").closest("button")!);

    expect(onEdit).toHaveBeenCalledTimes(1);
    const [edited] = onEdit.mock.calls[0];

    expect(edited).toMatchObject({
      id: basePayment.id,
      description: "Expensas agosto",
      amount: 1500,
      paymentCurrency: basePayment.paymentCurrency,
      // La fecha puede quedar como original si no la cambiamos
      date: basePayment.date,
    });
  });

  it("llama onDelete con el pago original", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<PaymentItem payment={basePayment} onDelete={onDelete} />, {
      wrapper: WithTheme,
    });

    await user.click(screen.getByTestId("DeleteIcon").closest("button")!);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(basePayment);
  });
});
