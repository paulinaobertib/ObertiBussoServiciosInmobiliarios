import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SummaryCard } from "../../../components/contracts/SummaryCard";
import { SvgIcon } from "@mui/material";

describe("SummaryCard", () => {
  it("renderiza correctamente el icono, label y valor", () => {
    const icon = <SvgIcon data-testid="test-icon" />;
    render(<SummaryCard icon={icon} label="Contratos Totales:" value={5} />);

    // Verifica que el icono esté presente
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();

    // Verifica el label
    expect(screen.getByText("Contratos Totales:")).toBeInTheDocument();

    // Verifica el valor
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("muestra correctamente un valor grande", () => {
    render(<SummaryCard icon={<div data-testid="icon" />} label="Contratos Activos:" value={1234} />);
    expect(screen.getByText("Contratos Activos:")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });
});
