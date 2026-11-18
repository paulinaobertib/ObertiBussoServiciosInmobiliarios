/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RentCalculatorPage from "../RentCalculatorPage";
import type { RentCalculation } from "../../app/shared/types/rentCalculator";

vi.mock("../BasePage", () => ({
  default: ({ children }: any) => <div>{children}</div>,
  BasePage: ({ children }: any) => <div>{children}</div>,
}));

const mockCalculate = vi.fn();
vi.mock("../../app/shared/services/rentCalculator.service", () => ({
  calculateRent: (...args: any[]) => mockCalculate(...args),
}));

const result: RentCalculation = {
  index: "IPC",
  ipcLag: 2,
  initialAmount: 500000,
  startDate: "2025-03-01",
  months: 3,
  currentAmount: 767815.41,
  accumulatedPercent: 53.56,
  dataUpdatedTo: "oct 2026",
  source: "INDEC",
  periods: [
    {
      number: 1,
      date: "2025-06-01",
      fromLabel: "ene 2025",
      toLabel: "abr 2025",
      fromValue: 1,
      toValue: 1.09,
      variationPercent: 9.17,
      amount: 545871.73,
      accumulatedPercent: 9.17,
      pending: false,
      pendingReason: null,
      months: [{ label: "feb 2025", percent: 2.4 }],
    },
    {
      number: 2,
      date: "2099-01-01",
      fromLabel: "oct 2098",
      toLabel: "nov 2098",
      fromValue: 1,
      toValue: null,
      variationPercent: null,
      amount: null,
      accumulatedPercent: null,
      pending: true,
      pendingReason: "El INDEC publica el IPC de noviembre a mediados de diciembre.",
      months: [],
    },
  ],
};

const renderPage = (url = "/calculadora-alquiler") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <RentCalculatorPage />
    </MemoryRouter>
  );

describe("RentCalculatorPage", () => {
  beforeEach(() => {
    mockCalculate.mockReset();
  });

  it("no deja calcular sin monto", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Calcular/i })).toBeDisabled();
  });

  it("calcula con los datos del formulario y muestra el resultado", async () => {
    mockCalculate.mockResolvedValue(result);
    renderPage();

    fireEvent.change(screen.getByLabelText(/Valor inicial/i), { target: { value: "500000" } });
    expect(screen.getByLabelText(/Valor inicial/i)).toHaveValue("500.000");
    fireEvent.change(screen.getByLabelText(/Fecha de inicio/i), { target: { value: "2025-03-01" } });
    fireEvent.click(screen.getByText("Trimestral"));
    fireEvent.click(screen.getByRole("button", { name: /^Calcular$/i }));

    await waitFor(() =>
      expect(mockCalculate).toHaveBeenCalledWith({ amount: 500000, startDate: "2025-03-01", months: 3, index: "IPC", ipcLag: 2 })
    );
    expect(await screen.findByText("$ 767.815")).toBeInTheDocument();
    expect(screen.getAllByText(/El INDEC publica el IPC de noviembre/).length).toBeGreaterThan(0);
    expect(screen.getByText("$ 545.872")).toBeInTheDocument();
  });

  it("calcula solo al abrir un link compartido", async () => {
    mockCalculate.mockResolvedValue({ ...result, index: "ICL", ipcLag: null });
    renderPage("/calculadora-alquiler?monto=200000&inicio=2025-11-18&meses=6&indice=ICL");

    await waitFor(() =>
      expect(mockCalculate).toHaveBeenCalledWith({ amount: 200000, startDate: "2025-11-18", months: 6, index: "ICL", ipcLag: 2 })
    );
    expect(screen.queryByLabelText(/Qué meses de IPC/i)).not.toBeInTheDocument();
  });

  it("muestra el error del servidor", async () => {
    mockCalculate.mockRejectedValue({ response: { data: "El ICL existe desde el 01/07/2020. Para contratos anteriores usá el IPC." } });
    renderPage("/calculadora-alquiler?monto=1000&inicio=2019-01-01&meses=12&indice=ICL");

    expect(await screen.findByText(/El ICL existe desde/)).toBeInTheDocument();
  });
});
