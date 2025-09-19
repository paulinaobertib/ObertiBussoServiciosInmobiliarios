import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContractSummary } from "../../../components/contracts/ContractSummary";
import { ContractType, ContractStatus } from "../../../types/contract";

const baseData = {
  propertyId: 101,
  userId: "U1",
  contractType: ContractType.VIVIENDA,
  contractStatus: ContractStatus.ACTIVO,
  startDate: "2024-01-01",
  endDate: "2025-01-01",
  currency: "ARS",
  initialAmount: 50000,
  adjustmentFrequencyMonths: 12,
  adjustmentIndexId: 2,
  note: "Contrato de prueba",
  hasDeposit: true,
  depositAmount: 10000,
  depositNote: "Depósito inicial",
};

describe("ContractSummary", () => {
  it("muestra mensaje de error si data es null", () => {
    render(<ContractSummary data={null} guarantorIds={[]} utilityIds={[]} />);
    expect(screen.getByText("El formulario aún no está listo.")).toBeInTheDocument();
  });

  it("renderiza todos los campos básicos", () => {
    render(<ContractSummary data={baseData as any} guarantorIds={[]} utilityIds={[]} />);

    expect(screen.getByText("Propiedad")).toBeInTheDocument();
    expect(screen.getByText("101")).toBeInTheDocument();

    expect(screen.getByText("Usuario")).toBeInTheDocument();
    expect(screen.getByText("U1")).toBeInTheDocument();

    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText(ContractType.VIVIENDA)).toBeInTheDocument();

    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText(ContractStatus.ACTIVO)).toBeInTheDocument();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();

    expect(screen.getByText("Fin")).toBeInTheDocument();
    expect(screen.getByText("2025-01-01")).toBeInTheDocument();

    expect(screen.getByText("Moneda")).toBeInTheDocument();
    expect(screen.getByText("ARS")).toBeInTheDocument();

    expect(screen.getByText("Monto inicial")).toBeInTheDocument();
    expect(screen.getByText("50000")).toBeInTheDocument();

    expect(screen.getByText("Frecuencia ajuste (meses)")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    expect(screen.getByText("Índice de ajuste")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Notas")).toBeInTheDocument();
    expect(screen.getByText("Contrato de prueba")).toBeInTheDocument();

    expect(screen.getByText("Depósito")).toBeInTheDocument();
    expect(screen.getByText("10000 (Depósito inicial)")).toBeInTheDocument();
  });

  it("muestra 'Ninguno' y 'Ninguna' cuando no hay garantes ni utilities", () => {
    render(<ContractSummary data={baseData as any} guarantorIds={[]} utilityIds={[]} />);
    expect(screen.getByText("Ninguno")).toBeInTheDocument();
    expect(screen.getByText("Ninguna")).toBeInTheDocument();
  });

  it("renderiza chips para garantes y utilities", () => {
    render(<ContractSummary data={baseData as any} guarantorIds={[1, 2]} utilityIds={[10, 20]} />);
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#10")).toBeInTheDocument();
    expect(screen.getByText("#20")).toBeInTheDocument();
  });
});
