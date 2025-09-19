import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContractsStats } from "../../../components/contracts/ContractsStats";

describe("ContractsStats", () => {
  it("renderiza los tres SummaryCard con labels y valores correctos", () => {
    render(<ContractsStats activeCount={5} totalCount={12} inactiveCount={7} />);

    // Totales
    expect(screen.getByText("Contratos Totales:")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    // Activos
    expect(screen.getByText("Contratos Activos:")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Inactivos
    expect(screen.getByText("Contratos Inactivos:")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
