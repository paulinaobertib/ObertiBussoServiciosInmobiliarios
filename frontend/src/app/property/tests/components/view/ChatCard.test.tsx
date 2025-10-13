/// <reference types="vitest" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const h = vi.hoisted(() => ({
  lastBarProps: null as any,
  lastPieProps: null as any,
  lastDoughnutProps: null as any,
  lastLineProps: null as any,
  lastRadarProps: null as any,
}));

vi.mock(
  "chart.js",
  () => ({
    Chart: { register: vi.fn() },
    ArcElement: {},
    BarElement: {},
    LineElement: {},
    CategoryScale: {},
    LinearScale: {},
    PointElement: {},
    RadialLinearScale: {},
    Tooltip: {},
    Legend: {},
    Title: {},
  }),
);

vi.mock(
  "react-chartjs-2",
  () => ({
    Bar: (props: any) => {
      h.lastBarProps = props;
      return <div data-testid="chart-bar" />;
    },
    Pie: (props: any) => {
      h.lastPieProps = props;
      return <div data-testid="chart-pie" />;
    },
    Doughnut: (props: any) => {
      h.lastDoughnutProps = props;
      return <div data-testid="chart-doughnut" />;
    },
    Line: (props: any) => {
      h.lastLineProps = props;
      return <div data-testid="chart-line" />;
    },
    Radar: (props: any) => {
      h.lastRadarProps = props;
      return <div data-testid="chart-radar" />;
    },
  }),
);

import ChartCard from "../../../components/view/ChartCard";

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("<ChartCard />", () => {
  beforeEach(() => {
    h.lastBarProps = null;
    h.lastPieProps = null;
    h.lastDoughnutProps = null;
    h.lastLineProps = null;
    h.lastRadarProps = null;
  });

  it("renderiza el título y pasa datos al gráfico por defecto (Bar)", () => {
    const data = { Ene: 10, Feb: 20, Mar: 15 };

    renderWithTheme(<ChartCard title="Ventas trimestrales" data={data} />);

    expect(screen.getByText(/Ventas trimestrales/i)).toBeInTheDocument();

    const bar = screen.getByTestId("chart-bar");
    expect(bar).toBeInTheDocument();
    expect(h.lastBarProps).toBeTruthy();
    expect(h.lastBarProps.data.labels).toEqual(["Ene", "Feb", "Mar"]);
    expect(h.lastBarProps.data.datasets[0].data).toEqual([10, 20, 15]);
    expect(h.lastBarProps.data.datasets[0].label).toBe("Ventas trimestrales");
  });

  it("funciona con datos vacíos y muestra mensaje en lugar del gráfico", () => {
    renderWithTheme(<ChartCard title="Vacío" data={{}} />);

    expect(screen.getByText(/Vacío/i)).toBeInTheDocument();
    expect(screen.getByText(/No hay datos disponibles/i)).toBeInTheDocument();
    expect(screen.queryByTestId("chart-bar")).not.toBeInTheDocument();
    expect(h.lastBarProps).toBeNull();
  });
});
