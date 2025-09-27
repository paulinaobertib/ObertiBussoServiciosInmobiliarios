import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// mocks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// hook useContractNames
let mockUserName = "UsuarioX";
let mockPropertyName = "PropiedadY";
vi.mock("../../../hooks/contracts/useContractNames", () => ({
  useContractNames: () => ({
    userName: mockUserName,
    propertyName: mockPropertyName,
  }),
}));

import { ContractItem, typeLabel } from "../../../components/contracts/ContractItem";
import { ContractType, ContractStatus } from "../../../types/contract";

const baseContract = {
  id: 123,
  userId: "u1",
  propertyId: 77,
  contractType: ContractType.VIVIENDA,
  contractStatus: ContractStatus.ACTIVO,
  startDate: "2024-01-14",
  endDate: "2025-01-14",
  lastPaidAmount: 5000,
  lastPaidDate: "2024-11-30",
};

beforeEach(() => {
  mockNavigate.mockReset();
  mockUserName = "UsuarioX";
  mockPropertyName = "PropiedadY";
});

describe("ContractItem", () => {
  it("renderiza labels de tipo y estado", () => {
    render(<ContractItem contract={baseContract as any} />);
    expect(screen.getByText("Vivienda")).toBeInTheDocument();
    expect(screen.getByText("ACTIVO")).toBeInTheDocument();
  });

  it("muestra nombres de usuario y propiedad", () => {
    render(<ContractItem contract={baseContract as any} />);
    expect(screen.getByText("UsuarioX")).toBeInTheDocument();
    expect(screen.getByText("PropiedadY")).toBeInTheDocument();
  });

  it("muestra placeholders 'Cargando...' cuando no hay nombres", () => {
    mockUserName = "";
    mockPropertyName = "";
    render(<ContractItem contract={baseContract as any} />);
    expect(screen.getAllByText("Cargando...").length).toBeGreaterThan(0);
  });

  it("formatea fechas con fmtLongDate", () => {
    render(<ContractItem contract={baseContract as any} />);
    expect(screen.getByText(/14 de Enero del 2024/)).toBeInTheDocument();
    expect(screen.getByText(/14 de Enero del 2025/)).toBeInTheDocument();
  });

  it("muestra último pago con monto y fecha", () => {
    render(<ContractItem contract={baseContract as any} />);
    expect(screen.getByText(/ARS \$ 5\.000/)).toBeInTheDocument();
    expect(screen.getByText("(30/11/2024)")).toBeInTheDocument();
  });

  it("muestra 'Sin registros' si no hay último pago", () => {
    const c = { ...baseContract, lastPaidAmount: null, lastPaidDate: null };
    render(<ContractItem contract={c as any} />);
    expect(screen.getByText(/Sin registros/)).toBeInTheDocument();
  });

  it("navega al detalle al hacer click en 'Ver detalles'", () => {
    render(<ContractItem contract={baseContract as any} />);
    fireEvent.click(screen.getByRole("button", { name: /Ver detalles/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/contracts/123");
  });

  it("typeLabel devuelve valores correctos", () => {
    expect(typeLabel(ContractType.VIVIENDA)).toBe("Vivienda");
    expect(typeLabel(ContractType.COMERCIAL)).toBe("Comercial");
    expect(typeLabel(ContractType.TEMPORAL)).toBe("Temporal");
    expect(typeLabel("OTRO" as any)).toBe("Otro");
    expect(typeLabel(undefined)).toBe("");
  });
});
