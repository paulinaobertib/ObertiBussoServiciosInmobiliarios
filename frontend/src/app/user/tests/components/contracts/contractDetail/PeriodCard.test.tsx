import { render, screen } from "@testing-library/react";
import PeriodCard from "../../../../components/contracts/contractDetail/PeriodCard";
import * as utils from "../../../../components/contracts/contractDetail/utils";

vi.mock("../../../../components/contracts/contractDetail/utils", () => ({
  fmtLongDate: vi.fn((d: string) => `formatted(${d})`),
}));

describe("PeriodCard", () => {
  const startDate = "2024-01-01";
  const endDate = "2024-12-31";

  it("renderiza el título principal", () => {
    render(<PeriodCard startDate={startDate} endDate={endDate} />);
    expect(screen.getByText("Período del Contrato")).toBeInTheDocument();
  });

  it("renderiza las etiquetas 'Desde' y 'Hasta'", () => {
    render(<PeriodCard startDate={startDate} endDate={endDate} />);
    expect(screen.getByText("Desde:")).toBeInTheDocument();
    expect(screen.getByText("Hasta:")).toBeInTheDocument();
  });

  it("muestra las fechas formateadas con fmtLongDate", () => {
    render(<PeriodCard startDate={startDate} endDate={endDate} />);
    expect(screen.getByText(`formatted(${startDate})`)).toBeInTheDocument();
    expect(screen.getByText(`formatted(${endDate})`)).toBeInTheDocument();
  });

  it("llama a fmtLongDate con los parámetros correctos", () => {
    render(<PeriodCard startDate={startDate} endDate={endDate} />);
    expect(utils.fmtLongDate).toHaveBeenCalledWith(startDate);
    expect(utils.fmtLongDate).toHaveBeenCalledWith(endDate);
  });
});
