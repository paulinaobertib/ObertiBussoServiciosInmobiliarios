import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../../../../components/contracts/contractDetail/Header";
import { typeLabel } from "../../../../components/contracts/contractDetail/utils";
import type { ContractGet } from "../../../../types/contract";

describe("Header", () => {
  const baseContract = {
    id: 1,
    contractType: "RENTAL",
    contractStatus: "ACTIVO",
  } as unknown as ContractGet; // ⬅️ hack: solo necesitamos estos campos

  const setup = (props = {}) => {
    const defaultProps = {
      contract: baseContract,
      isAdmin: true,
      savingStatus: false,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onToggleStatus: vi.fn(),
      onPayments: vi.fn(),
      onIncrease: vi.fn(),
    };
    return { ...defaultProps, ...props };
  };

  it("renderiza título, tipo de contrato y estado", () => {
    render(<Header {...setup()} />);
    expect(screen.getByText("Detalle de Contrato")).toBeInTheDocument();
    expect(screen.getByText(typeLabel("RENTAL" as any))).toBeInTheDocument();
    expect(screen.getByText("ACTIVO")).toBeInTheDocument();
  });

  it("no muestra botones si no es admin", () => {
    render(<Header {...setup({ isAdmin: false })} />);
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Inactivar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
  });

  it("muestra botones y dispara callbacks si es admin", () => {
    const props = setup();
    render(<Header {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(props.onEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Inactivar" }));
    expect(props.onToggleStatus).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(props.onDelete).toHaveBeenCalled();
  });

  it("deshabilita botón de estado cuando savingStatus=true", () => {
    render(<Header {...setup({ savingStatus: true })} />);
    const toggleBtn = screen.getByRole("button", { name: "Inactivar" });
    expect(toggleBtn).toBeDisabled();
  });

  it("muestra botón Reactivar si el contrato no está activo", () => {
    render(<Header {...setup({ contract: { ...baseContract, contractStatus: "INACTIVO" } as ContractGet })} />);
    expect(screen.getByRole("button", { name: "Reactivar" })).toBeInTheDocument();
  });
});
