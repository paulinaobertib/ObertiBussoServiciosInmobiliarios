import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DepositCard from "../../../../components/contracts/contractDetail/DepositCard";

describe("DepositCard", () => {
  it("muestra mensaje cuando no hay depósito", () => {
    render(<DepositCard hasDeposit={false} />);
    expect(
      screen.getByText("No hay depósitos registrados.")
    ).toBeInTheDocument();
  });

  it("muestra monto cuando hay depósito sin nota", () => {
    render(<DepositCard hasDeposit={true} depositAmount={1000} currency="ARS" />);
    expect(screen.getByText("Monto del Depósito")).toBeInTheDocument();
    expect(screen.getByText("ARS $ 1.000")).toBeInTheDocument();
    // no debería haber bloque de nota
    expect(screen.queryByText("Nota del Depósito")).not.toBeInTheDocument();
  });

  it("muestra monto y nota cuando hay depósito con nota", () => {
    render(
      <DepositCard
        hasDeposit={true}
        depositAmount={2000}
        currency="USD"
        depositNote="Nota de prueba"
      />
    );
    expect(screen.getByText("Monto del Depósito")).toBeInTheDocument();
    expect(screen.getByText("USD $ 2.000")).toBeInTheDocument();
    expect(screen.getByText("Nota del Depósito")).toBeInTheDocument();
    expect(screen.getByText("Nota de prueba")).toBeInTheDocument();
  });
});
