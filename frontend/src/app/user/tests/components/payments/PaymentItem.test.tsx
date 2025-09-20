/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PaymentItem } from "../../../components/payments/PaymentItem";
import { useAuthContext } from "../../../context/AuthContext";
import {
  Payment,
  PaymentCurrency,
  PaymentConcept,
} from "../../../types/payment";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// --- Mock AuthContext ---
vi.mock("../../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// --- Custom theme con quaternary ---
const customTheme = createTheme({
  palette: {
    quaternary: {
      main: "#f0f0f0",
    },
  } as any, // forzamos porque quaternary no está tipado en MUI
});

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider theme={customTheme}>{ui}</ThemeProvider>);

describe("PaymentItem", () => {
  const basePayment: Payment = {
    id: 1,
    description: "Pago inicial",
    amount: 1000,
    paymentCurrency: PaymentCurrency.ARS,
    date: "2025-09-01T00:00:00Z",
    concept: PaymentConcept.ALQUILER,
    contractId: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra datos y no muestra acciones si no es admin", () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });

    renderWithTheme(<PaymentItem payment={basePayment} />);

    expect(screen.getByText("2025-09-01 - $1000 ARS")).toBeInTheDocument();
    expect(
      screen.getByText(`Descripción: ${basePayment.description}`)
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /Editar pago/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Eliminar pago/i })
    ).not.toBeInTheDocument();
  });

  it("si es admin pero no hay handlers no muestra botones", () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });

    renderWithTheme(<PaymentItem payment={basePayment} />);

    expect(
      screen.queryByRole("button", { name: /Editar pago/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Eliminar pago/i })
    ).not.toBeInTheDocument();
  });

  it("permite editar y guardar sin cambios (no llama a onEdit)", () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const onEdit = vi.fn();

    renderWithTheme(<PaymentItem payment={basePayment} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: /Editar pago/i }));

    expect(screen.getByLabelText("Descripción")).toHaveValue(
      basePayment.description
    );
    expect(screen.getByLabelText("Monto")).toHaveValue(basePayment.amount);

    fireEvent.click(screen.getByRole("button", { name: /Guardar cambios/i }));
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("permite editar y guardar con cambios (llama a onEdit)", () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const onEdit = vi.fn();

    renderWithTheme(<PaymentItem payment={basePayment} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: /Editar pago/i }));

    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Nuevo desc" },
    });
    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "2000" },
    });

    // Cambiamos el valor de la moneda usando el input nativo de MUI
    const currencyInput = document.querySelector(
      'input.MuiSelect-nativeInput'
    ) as HTMLInputElement;
    fireEvent.change(currencyInput, { target: { value: PaymentCurrency.USD } });

    fireEvent.change(screen.getByLabelText("Fecha"), {
      target: { value: "2025-12-31" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Guardar cambios/i }));

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Nuevo desc",
        amount: 2000,
        paymentCurrency: PaymentCurrency.USD,
        date: "2025-12-31",
      })
    );
  });

  it("llama a onDelete al presionar el botón eliminar", () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const onDelete = vi.fn();

    renderWithTheme(<PaymentItem payment={basePayment} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Eliminar pago/i }));

    expect(onDelete).toHaveBeenCalledWith(basePayment);
  });
});
