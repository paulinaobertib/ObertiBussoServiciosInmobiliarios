import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommissionCard from "../../../../components/contracts/contractDetail/CommissionCard";

describe("CommissionCard", () => {
  it("muestra mensaje sin comisión registrada y botón agregar", () => {
    const handleAdd = vi.fn();
    render(<CommissionCard commission={null} onAdd={handleAdd} />);
    expect(screen.getByText("Sin comisión registrada.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar comisión" })).toBeInTheDocument();
  });

  it("muestra datos de una comisión completa", () => {
    const commission = {
      currency: "ARS",
      totalAmount: 5000,
      date: "2024-12-01",
      paymentType: "COMPLETO",
      status: "PAGADA",
      note: "nota test",
    };
    render(<CommissionCard commission={commission} paidCount={1} onEdit={() => {}} />);
    expect(screen.getByText("ARS")).toBeInTheDocument();
    expect(screen.getByText("5000")).toBeInTheDocument();
    // buscamos que haya algún texto que contenga "2024"
    expect(screen.getByText(/2024/)).toBeInTheDocument();
    expect(screen.getByText("COMPLETO")).toBeInTheDocument();
    expect(screen.getByText("PAGADA")).toBeInTheDocument();
    expect(screen.getByText("| nota test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar comisión" })).toBeInTheDocument();
  });

  it("renderiza cuotas pendientes y botón registrar pago", () => {
    const handleRegister = vi.fn();
    const commission = {
      currency: "USD",
      totalAmount: 200,
      date: "2025-01-01",
      paymentType: "CUOTAS",
      installments: 3,
    };
    render(<CommissionCard commission={commission} paidCount={1} onRegisterInstallment={handleRegister} />);
    expect(screen.getByText("Cuota #1")).toBeInTheDocument();
    expect(screen.getByText("Cuota #2")).toBeInTheDocument();
    expect(screen.getByText("Cuota #3")).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /Registrar Pago #2/i });
    fireEvent.click(btn);
    expect(handleRegister).toHaveBeenCalledWith(2);
  });

  it("muestra chip pendiente si no se han pagado cuotas", () => {
    const commission = {
      currency: "USD",
      totalAmount: 300,
      date: "2025-01-01",
      paymentType: "CUOTAS",
      installments: 2,
    };
    render(<CommissionCard commission={commission} paidCount={0} />);
    expect(screen.getByText("PENDIENTE")).toBeInTheDocument();
  });
});
