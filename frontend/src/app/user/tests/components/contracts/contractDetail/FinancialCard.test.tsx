import { render, screen } from "@testing-library/react";
import FinancialCard from "../../../../components/contracts/contractDetail/FinancialCard";

describe("FinancialCard", () => {
  const baseProps = {
    currency: "ARS",
    initialAmount: 1000,
    lastPaidAmount: 500,
    lastPaidDate: "2023-12-31",
    adjustmentFrequencyMonths: 12,
    adjustmentIndex: { code: "IPC", name: "Índice de Precios" },
    paymentsSorted: [],
    increasesSorted: [],
  };

  it("renderiza títulos y datos básicos", () => {
    render(<FinancialCard {...baseProps} />);
    expect(screen.getByText("Información Financiera")).toBeInTheDocument();
    expect(screen.getByText("Monto Inicial")).toBeInTheDocument();
    expect(screen.getByText("ARS $ 1.000")).toBeInTheDocument();
    expect(screen.getByText("Último Pago (Monto)")).toBeInTheDocument();
    expect(screen.getByText("ARS $ 500")).toBeInTheDocument();
    expect(screen.getByText("Último Pago (Fecha)")).toBeInTheDocument();
    expect(screen.getByText("31/12/2023")).toBeInTheDocument();
    expect(screen.getByText("Frecuencia de Ajuste")).toBeInTheDocument();
    expect(screen.getByText(/12\s*meses/)).toBeInTheDocument();
    expect(screen.getByText("Índice de Ajuste")).toBeInTheDocument();
    expect(screen.getByText("IPC - Índice de Precios")).toBeInTheDocument();
  });

  it("muestra 'Sin registros' cuando no hay último pago", () => {
    render(<FinancialCard {...baseProps} lastPaidAmount={null} lastPaidDate={null} />);
    expect(screen.getByText("Sin registros")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("muestra historial de pagos con items", () => {
    const payments = [
      { id: "1", date: "2024-01-31", type: "ALQUILER", amount: 700, currency: "ARS" },
      { id: "2", date: "2024-02-29", type: "EXPENSA", amount: 800, currency: "ARS" },
    ];
    render(<FinancialCard {...baseProps} paymentsSorted={payments} />);

    expect(screen.getByText("31/1/2024")).toBeInTheDocument();
    expect(screen.getByText("ARS $ 700")).toBeInTheDocument();
    expect(screen.getByText("29/2/2024")).toBeInTheDocument();
    expect(screen.getByText("ARS $ 800")).toBeInTheDocument();
  });

  it("muestra historial de aumentos con items", () => {
    const increases = [
      { id: "1", date: "2024-02-14", adjustment: 0.1, note: "ajuste test", amount: 1200, currency: "ARS" },
      { id: "2", date: "2024-03-14", adjustment: 300, amount: 1500, currency: "USD" },
    ];
    render(<FinancialCard {...baseProps} increasesSorted={increases} />);

    expect(screen.getByText("14/2/2024")).toBeInTheDocument();
    expect(screen.getByText("+0.1% · ajuste test")).toBeInTheDocument();
    expect(screen.getByText("ARS $ 1.200")).toBeInTheDocument();
    expect(screen.getByText("14/3/2024")).toBeInTheDocument();
    expect(screen.getByText("+300%")).toBeInTheDocument();
    expect(screen.getByText("USD $ 1.500")).toBeInTheDocument();
  });
});
