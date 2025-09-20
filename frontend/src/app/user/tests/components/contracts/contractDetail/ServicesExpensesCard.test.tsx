import { render, screen, fireEvent } from "@testing-library/react";
import ServicesExpensesCard from "../../../../components/contracts/contractDetail/ServicesExpensesCard";

// mockeamos utilidades
vi.mock("../../../../components/contracts/contractDetail/utils", () => ({
  fmtDate: vi.fn((d: string) => `formattedDate(${d})`),
  fmtMoney: vi.fn((n?: number | null, c?: string | null) => `${c ?? ""} $ ${n ?? 0}`),
  periodicityLabel: vi.fn((p?: string | null) => `period(${p})`),
}));

describe("ServicesExpensesCard", () => {
  const utilityNameMap = { 1: "Luz", 2: "Agua" };

  it("muestra mensaje vacío cuando no hay utilidades", () => {
    render(<ServicesExpensesCard utilities={[]} utilityNameMap={{}} />);
    expect(screen.getByText("Sin utilidades asociadas.")).toBeInTheDocument();
  });

  it("renderiza título y botón Agregar servicios si hay onManage", () => {
    const onManage = vi.fn();
    render(<ServicesExpensesCard utilities={[]} utilityNameMap={{}} onManage={onManage} />);
    expect(screen.getByText("Servicios y Expensas")).toBeInTheDocument();
    expect(screen.getByText("Agregar servicios")).toBeInTheDocument();
  });

  it("renderiza una utilidad con datos y acciones", () => {
    const onPay = vi.fn();
    const onIncrease = vi.fn();
    const onEdit = vi.fn();
    const onUnlink = vi.fn();

    const utilities = [
      {
        id: 1,
        utilityId: 1,
        periodicity: "MONTHLY",
        initialAmount: 100,
        lastPaidAmount: 200,
        lastPaidDate: "2024-01-01",
        notes: "nota test",
      },
    ];

    render(
      <ServicesExpensesCard
        utilities={utilities}
        utilityNameMap={utilityNameMap}
        currency="ARS"
        onPay={onPay}
        onIncrease={onIncrease}
        onEdit={onEdit}
        onUnlink={onUnlink}
      />
    );

    // nombre y periodicidad
    expect(screen.getByText("Luz")).toBeInTheDocument();
    expect(screen.getByText("period(MONTHLY)")).toBeInTheDocument();

    // montos
    expect(screen.getByText(/Monto inicial:/).parentElement)
    .toHaveTextContent("Monto inicial: ARS $ 100");

    expect(screen.getByText(/Monto actual:/).parentElement)
    .toHaveTextContent("Monto actual: ARS $ 100");


    expect(screen.getByText("nota test")).toBeInTheDocument();

    // último pago fecha
    expect(screen.getByText("(formattedDate(2024-01-01))")).toBeInTheDocument();

    // acciones
    fireEvent.click(screen.getByText("Pagar servicio"));
    expect(onPay).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("Aumentar"));
    expect(onIncrease).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("Desvincular"));
    expect(onUnlink).toHaveBeenCalledWith(1);
  });

  it("renderiza aumentos y permite expandir/colapsar", () => {
    const utilities = [
      {
        id: 2,
        utilityId: 2,
        periodicity: "MONTHLY",
        initialAmount: 50,
        increases: [
          { id: 10, adjustmentDate: "2024-02-01", amount: 300 },
          { id: 11, adjustmentDate: "2024-03-01", amount: 400 },
        ],
      },
    ];

    render(<ServicesExpensesCard utilities={utilities} utilityNameMap={utilityNameMap} currency="ARS" />);

    // al inicio solo debe estar el botón para ver
    const toggleBtn = screen.getByText("Ver aumentos");
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);

    // aparecen los aumentos
    expect(screen.getByText("formattedDate(2024-02-01): ARS $ 300")).toBeInTheDocument();
    expect(screen.getByText("formattedDate(2024-03-01): ARS $ 400")).toBeInTheDocument();

    // ahora el botón cambia a ocultar
    expect(screen.getByText("Ocultar aumentos")).toBeInTheDocument();
  });
});
