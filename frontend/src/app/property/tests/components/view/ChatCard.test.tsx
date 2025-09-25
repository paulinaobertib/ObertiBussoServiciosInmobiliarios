/// <reference types="vitest" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const h = vi.hoisted(() => ({ lastBarProps: null as any }));

vi.mock("@mui/x-charts/BarChart", () => ({
  BarChart: (props: any) => {
    h.lastBarProps = props;
    return <div data-testid="bar-chart" />;
  },
}));

import ChartCard from "../../../components/view/ChartCard";

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("<ChartCard />", () => {
  beforeEach(() => {
    h.lastBarProps = null;
  });

  it("renderiza el título y pasa categorías/valores a BarChart", () => {
    const data = { Ene: 10, Feb: 20, Mar: 15 };

    renderWithTheme(<ChartCard title="Ventas trimestrales" data={data} />);

    expect(
      screen.getByText(/Ventas trimestrales/i)
    ).toBeInTheDocument();

    const bar = screen.getByTestId("bar-chart");
    expect(bar).toBeInTheDocument();
    expect(h.lastBarProps).toBeTruthy();
    expect(h.lastBarProps.height).toBe(180);
    expect(h.lastBarProps.series).toEqual([{ data: [10, 20, 15] }]);
    expect(h.lastBarProps.xAxis).toEqual([
      { data: ["Ene", "Feb", "Mar"], scaleType: "band" },
    ]);
  });

it("funciona con datos vacíos (sin crashear) y muestra mensaje en lugar del BarChart", () => {
  renderWithTheme(<ChartCard title="Vacío" data={{}} />);

  // Se muestra el título
  expect(screen.getByText(/Vacío/i)).toBeInTheDocument();

  // Muestra el mensaje de EmptyState
  expect(screen.getByText(/Sin datos disponibles/i)).toBeInTheDocument();

  // No debería renderizar el BarChart
  expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
});

});
